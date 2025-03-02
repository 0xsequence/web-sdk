import {
  Button,
  ChevronRightIcon,
  CopyIcon,
  CloseIcon,
  GradientAvatar,
  Text,
  NumericInput,
  TextInput,
  Spinner,
  Card
} from '@0xsequence/design-system'
import { ContractVerificationStatus, TokenBalance } from '@0xsequence/indexer'
import {
  compareAddress,
  getNativeTokenInfoByChainId,
  useAnalyticsContext,
  ExtendedConnector,
  truncateAtMiddle,
  useExchangeRate,
  useCoinPrices,
  useBalancesSummary,
  useCheckWaasFeeOptions,
  useWaasFeeOptions
} from '@0xsequence/kit'
import { ethers } from 'ethers'
import { useState, ChangeEvent, useRef, useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain, useConfig, useSendTransaction } from 'wagmi'

import { ERC_20_ABI, HEADER_HEIGHT } from '../constants'
import { useNavigationContext } from '../contexts/Navigation'
import { useSettings, useNavigation } from '../hooks'
import { SendItemInfo } from '../shared/SendItemInfo'
import { TransactionConfirmation } from '../shared/TransactionConfirmation'
import { computeBalanceFiat, limitDecimals, isEthAddress } from '../utils'

interface SendCoinProps {
  chainId: number
  contractAddress: string
}

export const SendCoin = ({ chainId, contractAddress }: SendCoinProps) => {
  const { setNavigation } = useNavigation()
  const { setIsBackButtonEnabled } = useNavigationContext()
  const { analytics } = useAnalyticsContext()
  const { chains } = useConfig()
  const connectedChainId = useChainId()
  const { address: accountAddress = '', connector } = useAccount()
  const isConnectorSequenceBased = !!(connector as ExtendedConnector)?._wallet?.isSequenceBased
  const isCorrectChainId = connectedChainId === chainId
  const showSwitchNetwork = !isCorrectChainId && !isConnectorSequenceBased
  const { switchChainAsync } = useSwitchChain()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const { fiatCurrency } = useSettings()
  const [amount, setAmount] = useState<string>('0')
  const [toAddress, setToAddress] = useState<string>('')
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

  const { data: balances = [], isPending: isPendingBalances } = useBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: [accountAddress],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [contractAddress],
      omitNativeBalances: true
    }
  })
  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, chains)
  const tokenBalance = (balances as TokenBalance[]).find(b => b.contractAddress === contractAddress)
  const { data: coinPrices = [], isPending: isPendingCoinPrices } = useCoinPrices([
    {
      chainId,
      contractAddress
    }
  ])

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useExchangeRate(fiatCurrency.symbol)

  const isPending = isPendingBalances || isPendingCoinPrices || isPendingConversionRate

  // Handle fee option confirmation when pendingFeeOption is available
  useEffect(() => {
    if (pendingFeeOption && selectedFeeTokenAddress !== null) {
      confirmFeeOption(pendingFeeOption.id, selectedFeeTokenAddress)
    }
  }, [pendingFeeOption, selectedFeeTokenAddress])

  // Control back button when showing confirmation
  useEffect(() => {
    setIsBackButtonEnabled(!showConfirmation)
  }, [showConfirmation, setIsBackButtonEnabled])

  if (isPending) {
    return null
  }

  const isNativeCoin = compareAddress(contractAddress, ethers.ZeroAddress)
  const decimals = isNativeCoin ? nativeTokenInfo.decimals : tokenBalance?.contractInfo?.decimals || 18
  const name = isNativeCoin ? nativeTokenInfo.name : tokenBalance?.contractInfo?.name || ''
  const imageUrl = isNativeCoin ? nativeTokenInfo.logoURI : tokenBalance?.contractInfo?.logoURI
  const symbol = isNativeCoin ? nativeTokenInfo.symbol : tokenBalance?.contractInfo?.symbol || ''
  const amountToSendFormatted = amount === '' ? '0' : amount
  const amountRaw = ethers.parseUnits(amountToSendFormatted, decimals)

  const amountToSendFiat = computeBalanceFiat({
    balance: {
      ...(tokenBalance as TokenBalance),
      balance: amountRaw.toString()
    },
    prices: coinPrices,
    conversionRate,
    decimals
  })

  const insufficientFunds = amountRaw > BigInt(tokenBalance?.balance || '0')
  const isNonZeroAmount = amountRaw > 0n

  const handleChangeAmount = (ev: ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target

    // Prevent value from having more decimals than the token supports
    const formattedValue = limitDecimals(value, decimals)

    setAmount(formattedValue)
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

    if (isNativeCoin) {
      transaction = {
        to: toAddress as `0x${string}`,
        value: BigInt(sendAmount.toString())
      }
    } else {
      transaction = {
        to: tokenBalance?.contractAddress as `0x${string}`,
        data: new ethers.Interface(ERC_20_ABI).encodeFunctionData('transfer', [
          toAddress,
          ethers.toQuantity(sendAmount)
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
      await switchChainAsync({ chainId })
    }

    analytics?.track({
      event: 'SEND_TRANSACTION_REQUEST',
      props: {
        walletClient: (connector as ExtendedConnector | undefined)?._wallet?.id || 'unknown',
        source: 'sequence-kit/wallet'
      }
    })

    setIsSendTxnPending(true)

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

    if (isNativeCoin) {
      sendTransaction(
        {
          to: toAddress as `0x${string}`,
          value: BigInt(sendAmount.toString()),
          gas: null
        },
        txOptions
      )
    } else {
      sendTransaction(
        {
          to: tokenBalance?.contractAddress as `0x${string}`,
          data: new ethers.Interface(ERC_20_ABI).encodeFunctionData('transfer', [
            toAddress,
            ethers.toQuantity(sendAmount)
          ]) as `0x${string}`,
          gas: null
        },
        txOptions
      )
    }
  }

  return (
    <form
      className="flex p-5 pt-3 gap-2 flex-col"
      style={{
        marginTop: HEADER_HEIGHT
      }}
      onSubmit={handleSendClick}
    >
      {!showConfirmation && (
        <>
          <div className="flex bg-background-secondary rounded-xl p-4 gap-2 flex-col">
            <SendItemInfo
              imageUrl={imageUrl}
              decimals={decimals}
              name={name}
              symbol={symbol}
              balance={tokenBalance?.balance || '0'}
              fiatValue={computeBalanceFiat({
                balance: tokenBalance as TokenBalance,
                prices: coinPrices,
                conversionRate,
                decimals
              })}
              chainId={chainId}
            />
            <NumericInput
              ref={amountInputRef}
              style={{ fontSize: vars.fontSizes.xlarge, fontWeight: vars.fontWeights.bold }}
              name="amount"
              value={amount}
              onChange={handleChangeAmount}
              controls={
                <>
                  <Text className="whitespace-nowrap" variant="small" color="text50">
                    {`~${fiatCurrency.sign}${amountToSendFiat}`}
                  </Text>
                  <Button className="shrink-0" size="xs" shape="square" label="Max" onClick={handleMax} data-id="maxCoin" />
                  <Text variant="xlarge" fontWeight="bold" color="text100">
                    {symbol}
                  </Text>
                </>
              }
            />
            {insufficientFunds && (
              <Text className="mt-2" variant="normal" color="negative" asChild>
                <div>Insufficient Funds</div>
              </Text>
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
                style={{ height: '52px' }}
              >
                <div className="flex flex-row justify-center items-center gap-2">
                  <GradientAvatar size="sm" address={toAddress} />
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
                onClick={async () => await switchChainAsync({ chainId })}
                disabled={isCorrectChainId}
                style={{ height: '52px', borderRadius: vars.radii.md }}
              />
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
                style={{ height: '52px', borderRadius: vars.radii.md }}
              />
            )}
          </div>
        </>
      )}
      {showConfirmation && (
        <TransactionConfirmation
          name={name}
          symbol={symbol}
          imageUrl={imageUrl}
          amount={amountToSendFormatted}
          toAddress={toAddress}
          chainId={chainId}
          balance={tokenBalance?.balance || '0'}
          decimals={decimals}
          fiatValue={amountToSendFiat}
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
  )
}
