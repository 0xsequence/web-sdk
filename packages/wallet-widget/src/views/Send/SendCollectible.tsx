import {
  getNativeTokenInfoByChainId,
  useAnalyticsContext,
  ExtendedConnector,
  truncateAtMiddle,
  useCheckWaasFeeOptions,
  useWaasFeeOptions,
  waitForTransactionReceipt,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  useWallets
} from '@0xsequence/connect'
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
  useToast
} from '@0xsequence/design-system'
import { useGetTokenBalancesDetails, useClearCachedBalances, useIndexerClient } from '@0xsequence/hooks'
import { ContractType, ContractVerificationStatus, TokenBalance } from '@0xsequence/indexer'
import { useRef, useState, ChangeEvent, useEffect } from 'react'
import { encodeFunctionData, formatUnits, parseUnits, toHex, Hex } from 'viem'
import { useAccount, useChainId, useSwitchChain, useConfig, usePublicClient, useWalletClient } from 'wagmi'

import { WalletSelect } from '../../components/Select/WalletSelect'
import { SendItemInfo } from '../../components/SendItemInfo'
import { TransactionConfirmation } from '../../components/TransactionConfirmation'
import { ERC_1155_ABI, ERC_721_ABI, HEADER_HEIGHT_WITH_LABEL } from '../../constants'
import { useNavigationContext } from '../../contexts/Navigation'
import { useNavigation } from '../../hooks'
import { limitDecimals, isEthAddress } from '../../utils'

interface SendCollectibleProps {
  chainId: number
  contractAddress: string
  tokenId: string
}

export const SendCollectible = ({ chainId, contractAddress, tokenId }: SendCollectibleProps) => {
  const toast = useToast()
  const { wallets } = useWallets()
  const { setNavigation } = useNavigation()
  const { setIsBackButtonEnabled } = useNavigationContext()
  const { analytics } = useAnalyticsContext()
  const { chains } = useConfig()
  const connectedChainId = useChainId()
  const { address: accountAddress = '', connector } = useAccount()
  const indexerClient = useIndexerClient(chainId)
  const publicClient = usePublicClient({ chainId })
  const isConnectorSequenceBased = !!(connector as ExtendedConnector)?._wallet?.isSequenceBased
  const isConnectorWaas = !!(connector as ExtendedConnector)?.type?.includes('waas')
  const isCorrectChainId = connectedChainId === chainId
  const { clearCachedBalances } = useClearCachedBalances()
  const { switchChainAsync } = useSwitchChain()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const [amount, setAmount] = useState<string>('0')
  const [toAddress, setToAddress] = useState<string>('')
  const [showAmountControls, setShowAmountControls] = useState<boolean>(false)
  const { data: walletClient } = useWalletClient()
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

  const { data: dataTokens, isPending: isPendingBalances } = useGetTokenBalancesDetails({
    filter: {
      accountAddresses: [accountAddress],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [contractAddress],
      omitNativeBalances: false
    },
    chainIds: [chainId]
  })

  const tokenBalance = dataTokens && dataTokens.length > 0 ? dataTokens.find(balance => balance.tokenID === tokenId) : undefined

  let contractType: ContractType | undefined
  if (tokenBalance) {
    contractType = tokenBalance.contractType
  }

  useEffect(() => {
    if (tokenBalance) {
      if (contractType === 'ERC721') {
        setAmount('1')
        setShowAmountControls(false)
      } else if (contractType === 'ERC1155') {
        if (Number(formatUnits(BigInt(tokenBalance?.balance || 0), decimals)) >= 1) {
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
  const amountRaw = parseUnits(amountToSendFormatted, decimals)

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
    const maxAmount = Number(formatUnits(BigInt(tokenBalance?.balance || 0), decimals))

    const newAmount = Math.min(incrementedAmount, maxAmount).toString()

    setAmount(newAmount)
  }

  const handleMax = () => {
    amountInputRef.current?.focus()
    const maxAmount = formatUnits(BigInt(tokenBalance?.balance || 0), decimals).toString()

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

    if (!isCorrectChainId && !isConnectorSequenceBased) {
      await switchChainAsync({ chainId })
    }

    if (!isConnectorWaas) {
      executeTransaction()
      return
    }

    setIsCheckingFeeOptions(true)

    const sendAmount = parseUnits(amountToSendFormatted, decimals)
    let transaction

    switch (contractType) {
      case 'ERC721':
        transaction = {
          to: (tokenBalance as TokenBalance).contractAddress as `0x${string}`,
          data: encodeFunctionData({
            abi: ERC_721_ABI,
            functionName: 'safeTransferFrom',
            args: [accountAddress, toAddress, tokenId]
          })
        }
        break
      case 'ERC1155':
      default:
        transaction = {
          to: (tokenBalance as TokenBalance).contractAddress as `0x${string}`,
          data: encodeFunctionData({
            abi: ERC_1155_ABI,
            functionName: 'safeBatchTransferFrom',
            args: [accountAddress, toAddress, [tokenId], [toHex(sendAmount)], toHex(new Uint8Array())]
          })
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
    if (!isCorrectChainId && !isConnectorSequenceBased) {
      await switchChainAsync({ chainId })
    }

    analytics?.track({
      event: 'SEND_TRANSACTION_REQUEST',
      props: {
        walletClient: (connector as ExtendedConnector | undefined)?._wallet?.id || 'unknown',
        source: 'sequence-kit/wallet'
      }
    })

    if (!walletClient) {
      console.error('Wallet client not found')
      toast({
        title: 'Error',
        description: 'Wallet client not available. Please ensure your wallet is connected.',
        variant: 'error'
      })
      setIsSendTxnPending(false)
      return
    }

    setIsSendTxnPending(true)

    const sendAmount = parseUnits(amountToSendFormatted, decimals)
    let txHash: Hex | undefined
    let txData: Hex | undefined

    try {
      switch (contractType) {
        case 'ERC721':
          console.log('Sending ERC721 via walletClient')
          txData = encodeFunctionData({
            abi: ERC_721_ABI,
            functionName: 'safeTransferFrom',
            args: [accountAddress, toAddress, tokenId]
          })
          txHash = await walletClient.sendTransaction({
            account: accountAddress as `0x${string}`,
            to: (tokenBalance as TokenBalance).contractAddress as `0x${string}`,
            data: txData,
            chain: chains.find(c => c.id === chainId)
          })
          break
        case 'ERC1155':
        default:
          console.log('Sending ERC1155 via walletClient')
          txData = encodeFunctionData({
            abi: ERC_1155_ABI,
            functionName: 'safeBatchTransferFrom',
            args: [accountAddress, toAddress, [tokenId], [toHex(sendAmount)], toHex(new Uint8Array())]
          })
          txHash = await walletClient.sendTransaction({
            account: accountAddress as `0x${string}`,
            to: (tokenBalance as TokenBalance).contractAddress as `0x${string}`,
            data: txData,
            chain: chains.find(c => c.id === chainId)
          })
      }

      // Handle successful transaction submission
      setIsBackButtonEnabled(true)
      if (txHash) {
        setNavigation({
          location: 'home'
        })
        setIsSendTxnPending(false) // Set pending to false immediately after getting hash

        toast({
          title: 'Transaction sent',
          description: `Successfully sent ${amountToSendFormatted} ${name} to ${toAddress}`,
          variant: 'success'
        })

        // Wait for receipt in the background
        if (publicClient) {
          waitForTransactionReceipt({
            indexerClient,
            txnHash: txHash,
            publicClient,
            confirmations: TRANSACTION_CONFIRMATIONS_DEFAULT
          })
            .then(() => {
              clearCachedBalances()
              console.log('Transaction confirmed and balances cleared:', txHash)
            })
            .catch(error => {
              console.error('Error waiting for transaction receipt:', error)
            })
        }
      } else {
        // Handle case where txHash is unexpectedly undefined
        setIsSendTxnPending(false)
        toast({
          title: 'Transaction Error',
          description: 'Transaction submitted but no hash received.',
          variant: 'error'
        })
      }
    } catch (error: any) {
      console.error('Transaction failed:', error)
      setIsSendTxnPending(false)
      setIsBackButtonEnabled(true)
      toast({
        title: 'Transaction Failed',
        description: error?.shortMessage || error?.message || 'An unknown error occurred.',
        variant: 'error'
      })
    }
  }

  const maxAmount = formatUnits(BigInt(tokenBalance?.balance || 0), decimals).toString()

  const isMinimum = Number(amount) === 0
  const isMaximum = Number(amount) >= Number(maxAmount)

  return (
    <form
      className="flex px-4 pb-4 gap-2 flex-col"
      style={{
        marginTop: HEADER_HEIGHT_WITH_LABEL
      }}
      onSubmit={handleSendClick}
    >
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
              <Text className="mt-2" variant="normal" color="negative" asChild>
                <div>Insufficient Balance</div>
              </Text>
            )}
          </div>
          <div className="flex bg-background-secondary rounded-xl p-4 gap-2 flex-col">
            <Text variant="normal" color="muted">
              To
            </Text>
            {isEthAddress(toAddress) ? (
              <Card
                className="flex w-full flex-row justify-between items-center"
                clickable
                onClick={handleToAddressClear}
                style={{ height: '52px' }}
              >
                <div className="flex flex-row justify-center items-center gap-2">
                  <GradientAvatar size="sm" address={toAddress} />
                  <Text color="primary" variant="normal">{`0x${truncateAtMiddle(toAddress.substring(2), 10)}`}</Text>
                </div>
                <CloseIcon className="text-white" size="sm" />
              </Card>
            ) : (
              <>
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
                {wallets.length > 1 && <WalletSelect selectedWallet={toAddress} onClick={setToAddress} />}
              </>
            )}
          </div>

          <div className="flex items-center justify-center mt-2" style={{ height: '52px' }}>
            {isCheckingFeeOptions ? (
              <Spinner />
            ) : (
              <Button
                className="text-primary w-full"
                variant="primary"
                size="lg"
                type="submit"
                disabled={!isNonZeroAmount || !isEthAddress(toAddress) || insufficientFunds}
                label="Send"
                rightIcon={ChevronRightIcon}
              />
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
          disabled={!isCorrectChainId && !isConnectorSequenceBased}
          onConfirm={() => {
            executeTransaction()
          }}
          onCancel={() => {
            setShowConfirmation(false)
          }}
        />
      )}
    </form>
  )
}
