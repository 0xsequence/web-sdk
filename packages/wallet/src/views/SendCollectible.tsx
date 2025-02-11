import {
  Button,
  ChevronRightIcon,
  CopyIcon,
  CloseIcon,
  GradientAvatar,
  AddIcon,
  SubtractIcon,
  Text,
  NumericInput,
  TextInput,
  Spinner,
  Card,
} from '@0xsequence/design-system';
import { ContractVerificationStatus, TokenBalance } from '@0xsequence/indexer'
import {
  getNativeTokenInfoByChainId,
  useAnalyticsContext,
  ExtendedConnector,
  truncateAtMiddle,
  useCollectibleBalanceDetails,
  useCheckWaasFeeOptions,
  useWaasFeeOptions
} from '@0xsequence/kit'
import { ethers } from 'ethers'
import { useRef, useState, ChangeEvent, useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain, useConfig, useSendTransaction } from 'wagmi'

import { ERC_1155_ABI, ERC_721_ABI, HEADER_HEIGHT } from '../constants'
import { useNavigationContext } from '../contexts/Navigation'
import { useNavigation } from '../hooks'
import { SendItemInfo } from '../shared/SendItemInfo'
import { TransactionConfirmation } from '../shared/TransactionConfirmation'
import { limitDecimals, isEthAddress } from '../utils'

interface SendCollectibleProps {
  chainId: number
  contractAddress: string
  tokenId: string
}

export const SendCollectible = ({ chainId, contractAddress, tokenId }: SendCollectibleProps) => {
  const { setNavigation } = useNavigation()
  const { setIsBackButtonEnabled } = useNavigationContext()
  const { analytics } = useAnalyticsContext()
  const { chains } = useConfig()
  const connectedChainId = useChainId()
  const { address: accountAddress = '', connector } = useAccount()
  const isConnectorSequenceBased = !!(connector as ExtendedConnector)?._wallet?.isSequenceBased
  const isCorrectChainId = connectedChainId === chainId
  const showSwitchNetwork = !isCorrectChainId && !isConnectorSequenceBased
  const { switchChain } = useSwitchChain()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const [amount, setAmount] = useState<string>('0')
  const [toAddress, setToAddress] = useState<string>('')
  const [showAmountControls, setShowAmountControls] = useState<boolean>(false)
  const { sendTransaction } = useSendTransaction()
  const [isSendTxnPending, setIsSendTxnPending] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [feeOptions, setFeeOptions] = useState<
    | {
        options: any[]
        chainId: number
      }
    | undefined
  >()
  const [isCheckingFeeOptions, setIsCheckingFeeOptions] = useState(false)
  const [selectedFeeTokenAddress, setSelectedFeeTokenAddress] = useState<string | null>(null)
  const checkFeeOptions = useCheckWaasFeeOptions()
  const [pendingFeeOption, confirmFeeOption, _rejectFeeOption] = useWaasFeeOptions()

  const { data: tokenBalance, isPending: isPendingBalances } = useCollectibleBalanceDetails({
    filter: {
      accountAddresses: [accountAddress],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [contractAddress],
      omitNativeBalances: true
    },
    chainId,
    tokenId
  })
  const { contractType } = tokenBalance as TokenBalance

  useEffect(() => {
    if (tokenBalance) {
      if (contractType === 'ERC721') {
        setAmount('1')
        setShowAmountControls(false)
      } else if (contractType === 'ERC1155') {
        if (Number(ethers.formatUnits(tokenBalance?.balance || 0, decimals)) >= 1) {
          setAmount('1')
        }
        setShowAmountControls(true)
      }
    }
  }, [tokenBalance])

  useEffect(() => {
    if (pendingFeeOption && selectedFeeTokenAddress !== null) {
      confirmFeeOption(pendingFeeOption.id, selectedFeeTokenAddress)
    }
  }, [pendingFeeOption, selectedFeeTokenAddress])

  useEffect(() => {
    setIsBackButtonEnabled(!showConfirmation)
  }, [showConfirmation, setIsBackButtonEnabled])

  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, chains)

  const isPending = isPendingBalances

  if (isPending) {
    return null
  }

  const decimals = tokenBalance?.tokenMetadata?.decimals || 0
  const name = tokenBalance?.tokenMetadata?.name || 'Unknown'
  const imageUrl = tokenBalance?.tokenMetadata?.image || tokenBalance?.contractInfo?.logoURI || ''
  const amountToSendFormatted = amount === '' ? '0' : amount
  const amountRaw = ethers.parseUnits(amountToSendFormatted, decimals)

  const insufficientFunds = amountRaw > BigInt(tokenBalance?.balance || '0')
  const isNonZeroAmount = amountRaw > 0n

  const handleChangeAmount = (ev: ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target

    // Prevent value from having more decimals than the token supports
    const formattedValue = limitDecimals(value, decimals)

    setAmount(formattedValue)
  }

  const handleSubtractOne = () => {
    amountInputRef.current?.focus()
    const decrementedAmount = Number(amount) - 1

    const newAmount = Math.max(decrementedAmount, 0).toString()
    setAmount(newAmount)
  }

  const handleAddOne = () => {
    amountInputRef.current?.focus()
    const incrementedAmount = Number(amount) + 1
    const maxAmount = Number(ethers.formatUnits(tokenBalance?.balance || 0, decimals))

    const newAmount = Math.min(incrementedAmount, maxAmount).toString()

    setAmount(newAmount)
  }

  const handleMax = () => {
    amountInputRef.current?.focus()
    const maxAmount = ethers.formatUnits(tokenBalance?.balance || 0, decimals).toString()

    setAmount(maxAmount)
  }

  const handlePaste = async () => {
    const result = await navigator.clipboard.readText()
    setToAddress(result)
  }

  const handleToAddressClear = () => {
    setToAddress('')
  }

  const handleSendClick = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsCheckingFeeOptions(true)

    const sendAmount = ethers.parseUnits(amountToSendFormatted, decimals)
    let transaction

    switch (contractType) {
      case 'ERC721':
        transaction = {
          to: (tokenBalance as TokenBalance).contractAddress as `0x${string}`,
          data: new ethers.Interface(ERC_721_ABI).encodeFunctionData('safeTransferFrom', [
            accountAddress,
            toAddress,
            tokenId
          ]) as `0x${string}`
        }
        break
      case 'ERC1155':
      default:
        transaction = {
          to: (tokenBalance as TokenBalance).contractAddress as `0x${string}`,
          data: new ethers.Interface(ERC_1155_ABI).encodeFunctionData('safeBatchTransferFrom', [
            accountAddress,
            toAddress,
            [tokenId],
            [ethers.toQuantity(sendAmount)],
            new Uint8Array()
          ]) as `0x${string}`
        }
    }

    // Check fee options before showing confirmation
    const feeOptionsResult = await checkFeeOptions({
      transactions: [transaction],
      chainId
    })

    setFeeOptions(
      feeOptionsResult?.feeOptions
        ? {
            options: feeOptionsResult.feeOptions,
            chainId
          }
        : undefined
    )

    setShowConfirmation(true)

    setIsCheckingFeeOptions(false)
  }

  const executeTransaction = async () => {
    if (!isCorrectChainId && isConnectorSequenceBased) {
      switchChain({ chainId })
    }

    const sendAmount = ethers.parseUnits(amountToSendFormatted, decimals)

    const txOptions = {
      onSettled: (result: any) => {
        setIsBackButtonEnabled(true)

        if (result) {
          setNavigation({
            location: 'home'
          })
        }
        setIsSendTxnPending(false)
      }
    }

    switch (contractType) {
      case 'ERC721':
        analytics?.track({
          event: 'SEND_TRANSACTION_REQUEST',
          props: {
            walletClient: (connector as ExtendedConnector | undefined)?._wallet?.id || 'unknown',
            source: 'sequence-kit/wallet'
          }
        })
        setIsSendTxnPending(true)
        // _from, _to, _id
        sendTransaction(
          {
            to: (tokenBalance as TokenBalance).contractAddress as `0x${string}`,
            data: new ethers.Interface(ERC_721_ABI).encodeFunctionData('safeTransferFrom', [
              accountAddress,
              toAddress,
              tokenId
            ]) as `0x${string}`,
            gas: null
          },
          txOptions
        )
        break
      case 'ERC1155':
      default:
        analytics?.track({
          event: 'SEND_TRANSACTION_REQUEST',
          props: {
            walletClient: (connector as ExtendedConnector | undefined)?._wallet?.id || 'unknown',
            source: 'sequence-kit/wallet'
          }
        })
        setIsSendTxnPending(true)
        // _from, _to, _ids, _amounts, _data
        sendTransaction(
          {
            to: (tokenBalance as TokenBalance).contractAddress as `0x${string}`,
            data: new ethers.Interface(ERC_1155_ABI).encodeFunctionData('safeBatchTransferFrom', [
              accountAddress,
              toAddress,
              [tokenId],
              [ethers.toQuantity(sendAmount)],
              new Uint8Array()
            ]) as `0x${string}`,
            gas: null
          },
          txOptions
        )
    }
  }

  const maxAmount = ethers.formatUnits(tokenBalance?.balance || 0, decimals).toString()

  const isMinimum = Number(amount) === 0
  const isMaximum = Number(amount) >= Number(maxAmount)

  return (
    <form
      className="flex p-5 pt-3 gap-2 flex-col"
      style={{
        marginTop: HEADER_HEIGHT
      }}
      onSubmit={handleSendClick}>
      {!showConfirmation && (
        <>
          <div className="flex bg-background-secondary rounded-xl p-4 gap-2 flex-col">
            <SendItemInfo
              imageUrl={imageUrl}
              showSquareImage
              decimals={decimals}
              name={name}
              symbol={''}
              balance={tokenBalance?.balance || '0'}
              chainId={chainId}
            />
            <NumericInput
              ref={amountInputRef}
              style={{ fontSize: vars.fontSizes.xlarge, fontWeight: vars.fontWeights.bold }}
              name="amount"
              value={amount}
              onChange={handleChangeAmount}
              disabled={!showAmountControls}
              controls={
                <>
                  {showAmountControls && (
                    <div className="flex gap-2">
                      <Button disabled={isMinimum} size="xs" onClick={handleSubtractOne} leftIcon={SubtractIcon} />
                      <Button disabled={isMaximum} size="xs" onClick={handleAddOne} leftIcon={AddIcon} />
                      <Button className="shrink-0" size="xs" shape="square" label="Max" onClick={handleMax} data-id="maxCoin" />
                    </div>
                  )}
                </>
              }
            />
            {insufficientFunds && (
              <Text className="mt-2" variant="normal" color="negative" asChild><div>Insufficient Balance
                              </div></Text>
            )}
          </div>
          <div className="flex bg-background-secondary rounded-xl p-4 gap-2 flex-col">
            <Text variant="normal" color="text50">
              To
            </Text>
            {isEthAddress(toAddress) ? (
              <Card
                className="flex w-full flex-row justify-between items-center"
                clickable
                onClick={handleToAddressClear}
                style={{ height: '52px' }}>
                <div className="flex flex-row justify-center items-center gap-2">
                  <GradientAvatar address={toAddress} style={{ width: '20px' }} />
                  <Text color="text100" variant="normal">{`0x${truncateAtMiddle(toAddress.substring(2), 10)}`}</Text>
                </div>
                <CloseIcon className="text-white" size="sm" />
              </Card>
            ) : (
              <TextInput
                value={toAddress}
                onChange={ev => setToAddress(ev.target.value)}
                placeholder={`${nativeTokenInfo.name} Address (0x...)`}
                name="to-address"
                data-1p-ignore
                controls={
                  <Button
                    className="shrink-0"
                    size="xs"
                    shape="square"
                    label="Paste"
                    onClick={handlePaste}
                    data-id="to-address"
                    leftIcon={CopyIcon}
                  />
                }
              />
            )}
          </div>

          {showSwitchNetwork && (
            <div className="mt-3">
              <Text className="mb-2" variant="small" color="negative">
                The wallet is connected to the wrong network. Please switch network before proceeding
              </Text>
              <Button
                className="mt-2 w-full"
                variant="primary"
                type="button"
                label="Switch Network"
                onClick={() => switchChain({ chainId })}
                disabled={isCorrectChainId}
                style={{ height: '52px', borderRadius: vars.radii.md }} />
            </div>
          )}

          <div className="flex items-center justify-center" style={{ height: '52px' }}>
            {isCheckingFeeOptions ? (
              <Spinner />
            ) : (
              <Button
                className="text-text100 mt-3 w-full"
                variant="primary"
                type="submit"
                disabled={
                  !isNonZeroAmount ||
                  !isEthAddress(toAddress) ||
                  insufficientFunds ||
                  (!isCorrectChainId && !isConnectorSequenceBased)
                }
                label="Send"
                rightIcon={ChevronRightIcon}
                style={{ height: '52px', borderRadius: vars.radii.md }} />
            )}
          </div>
        </>
      )}
      {showConfirmation && (
        <TransactionConfirmation
          name={name}
          symbol=""
          imageUrl={imageUrl}
          amount={amountToSendFormatted}
          toAddress={toAddress}
          showSquareImage={true}
          chainId={chainId}
          balance={tokenBalance?.balance || '0'}
          decimals={decimals}
          feeOptions={feeOptions}
          onSelectFeeOption={feeTokenAddress => {
            setSelectedFeeTokenAddress(feeTokenAddress)
          }}
          isLoading={isSendTxnPending}
          onConfirm={() => {
            executeTransaction()
          }}
          onCancel={() => {
            setShowConfirmation(false)
          }}
        />
      )}
    </form>
  );
}
