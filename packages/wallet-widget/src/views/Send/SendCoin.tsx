import {
  compareAddress,
  getNativeTokenInfoByChainId,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  truncateAtMiddle,
  useAnalyticsContext,
  useFeeOptions,
  useSendWalletTransaction,
  useWaasFeeOptions,
  useWallets,
  waitForTransactionReceipt,
  type ExtendedConnector
} from '@0xsequence/connect'
import {
  Button,
  Card,
  ChevronRightIcon,
  CloseIcon,
  CopyIcon,
  GradientAvatar,
  NumericInput,
  Spinner,
  Text,
  TextInput
} from '@0xsequence/design-system'
import {
  useClearCachedBalances,
  useGetCoinPrices,
  useGetExchangeRate,
  useGetSingleTokenBalance,
  useIndexerClient
} from '@0xsequence/hooks'
import type { TokenBalance } from '@0xsequence/indexer'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { encodeFunctionData, formatUnits, parseUnits, toHex, zeroAddress, type Hex } from 'viem'
import { useChainId, useConfig, useConnection, usePublicClient, useSwitchChain, useWalletClient } from 'wagmi'

import { AllButActiveWalletSelect } from '../../components/Select/AllButActiveWalletSelect.js'
import { SendItemInfo } from '../../components/SendItemInfo.js'
import { TransactionConfirmation } from '../../components/TransactionConfirmation.js'
import { EVENT_SOURCE, EVENT_TYPES } from '../../constants/analytics.js'
import { ERC_20_ABI } from '../../constants/index.js'
import { useNavigationContext } from '../../contexts/Navigation.js'
import { useNavigation, useSettings } from '../../hooks/index.js'
import { computeBalanceFiat, isEthAddress, limitDecimals } from '../../utils/index.js'

interface SendCoinProps {
  chainId: number
  contractAddress: string
}

export const SendCoin = ({ chainId, contractAddress }: SendCoinProps) => {
  const { clearCachedBalances } = useClearCachedBalances()
  const publicClient = usePublicClient({ chainId })
  const indexerClient = useIndexerClient(chainId)
  const { wallets } = useWallets()
  const { setNavigation } = useNavigation()
  const { setIsBackButtonEnabled } = useNavigationContext()
  const { analytics } = useAnalyticsContext()
  const { chains } = useConfig()
  const connectedChainId = useChainId()
  const { address: accountAddress = '', connector } = useConnection()
  const isConnectorSequenceBased = !!(connector as ExtendedConnector)?._wallet?.isSequenceBased

  const isCorrectChainId = connectedChainId === chainId
  const { switchChainAsync } = useSwitchChain()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const { fiatCurrency } = useSettings()
  const [amount, setAmount] = useState<string>('0')
  const [toAddress, setToAddress] = useState<string>('')
  const { data: walletClient } = useWalletClient()
  const [isSendTxnPending, setIsSendTxnPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedFeeTokenAddress, setSelectedFeeTokenAddress] = useState<string | null>(null)

  const [pendingV3FeeConfirmation, confirmV3FeeOption, rejectV3FeeOption] = useFeeOptions()
  const [pendingWaasFeeConfirmation, confirmWaasFeeOption, rejectWaasFeeOption] = useWaasFeeOptions()
  const { sendTransactionAsync: sendWalletTransactionAsync } = useSendWalletTransaction()

  const connectorType = (connector as ExtendedConnector | undefined)?.type
  const isWaasConnectorActive = connectorType === 'sequence-waas'
  const isSequenceV3ConnectorActive =
    connectorType === 'sequence-v3-wallet' || wallets.some(w => w.id === 'sequence-v3-wallet' && w.isActive)

  const activeFeeConfirmation = isWaasConnectorActive
    ? pendingWaasFeeConfirmation
    : isSequenceV3ConnectorActive
      ? pendingV3FeeConfirmation
      : undefined

  const feeOptions = activeFeeConfirmation
    ? {
        options: activeFeeConfirmation.options as any[],
        chainId: activeFeeConfirmation.chainId
      }
    : undefined

  const isConfirmationVisible = Boolean(activeFeeConfirmation)

  const { data: tokenBalance, isLoading: isLoadingBalances } = useGetSingleTokenBalance({
    chainId,
    contractAddress,
    accountAddress
  })

  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, chains)
  const { data: coinPrices = [], isLoading: isLoadingCoinPrices } = useGetCoinPrices([
    {
      chainId,
      contractAddress
    }
  ])

  const { data: conversionRate = 1, isLoading: isLoadingConversionRate } = useGetExchangeRate(fiatCurrency.symbol)

  const isLoading = isLoadingBalances || isLoadingCoinPrices || isLoadingConversionRate

  // Control back button when showing confirmation
  useEffect(() => {
    setIsBackButtonEnabled(!isConfirmationVisible)
  }, [isConfirmationVisible, setIsBackButtonEnabled])

  useEffect(() => {
    if (!feeOptions?.options?.length) {
      setSelectedFeeTokenAddress(null)
    }
  }, [feeOptions?.options?.length])

  if (isLoading) {
    return null
  }

  const isNativeCoin = compareAddress(contractAddress, zeroAddress)
  const decimals = isNativeCoin ? nativeTokenInfo.decimals : tokenBalance?.contractInfo?.decimals || 18
  const name = isNativeCoin ? nativeTokenInfo.name : tokenBalance?.contractInfo?.name || ''
  const imageUrl = isNativeCoin ? nativeTokenInfo.logoURI : tokenBalance?.contractInfo?.logoURI
  const symbol = isNativeCoin ? nativeTokenInfo.symbol : tokenBalance?.contractInfo?.symbol || ''
  const amountToSendFormatted = amount === '' ? '0' : amount
  const amountRaw = parseUnits(amountToSendFormatted, decimals)

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
    setErrorMsg(null)
    const { value } = ev.target

    // Prevent value from having more decimals than the token supports
    const formattedValue = limitDecimals(value, decimals)

    setAmount(formattedValue)
  }

  const handleMax = () => {
    setErrorMsg(null)
    amountInputRef.current?.focus()
    const maxAmount = formatUnits(BigInt(tokenBalance?.balance || 0), decimals).toString()

    setAmount(maxAmount)
  }

  const handlePaste = async () => {
    setErrorMsg(null)
    const result = await navigator.clipboard.readText()
    setToAddress(result)
  }

  const handleToAddressClear = () => {
    setErrorMsg(null)
    setToAddress('')
  }

  const handleSendClick = async (e: FormEvent<HTMLFormElement>) => {
    setErrorMsg(null)
    e.preventDefault()

    if (!isCorrectChainId && !isConnectorSequenceBased) {
      await switchChainAsync({ chainId })
    }

    executeTransaction()
  }

  const executeTransaction = async () => {
    if (!isCorrectChainId && isConnectorSequenceBased) {
      await switchChainAsync({ chainId })
    }

    if (!walletClient && !isSequenceV3ConnectorActive) {
      console.error('Wallet client not found')
      setErrorMsg('Wallet client not available. Please ensure your wallet is connected.')
      setIsSendTxnPending(false)
      return
    }

    setIsSendTxnPending(true)

    const sendAmount = parseUnits(amountToSendFormatted, decimals)
    let txHash: Hex | undefined

    try {
      if (isNativeCoin) {
        if (isSequenceV3ConnectorActive) {
          txHash = (await sendWalletTransactionAsync({
            chainId,
            transaction: {
              to: toAddress as `0x${string}`,
              value: BigInt(sendAmount.toString())
            }
          })) as Hex
        } else {
          txHash = await walletClient!.sendTransaction({
            account: accountAddress as `0x${string}`,
            to: toAddress as `0x${string}`,
            value: BigInt(sendAmount.toString()),
            chain: chains.find(c => c.id === chainId)
          })
        }
      } else {
        const data = encodeFunctionData({ abi: ERC_20_ABI, functionName: 'transfer', args: [toAddress, toHex(sendAmount)] })
        if (isSequenceV3ConnectorActive) {
          txHash = (await sendWalletTransactionAsync({
            chainId,
            transaction: {
              to: tokenBalance?.contractAddress as `0x${string}`,
              data
            }
          })) as Hex
        } else {
          txHash = await walletClient!.sendTransaction({
            account: accountAddress as `0x${string}`,
            to: tokenBalance?.contractAddress as `0x${string}`,
            data,
            chain: chains.find(c => c.id === chainId)
          })
        }
      }

      // Handle successful transaction submission
      setIsBackButtonEnabled(true)
      if (txHash) {
        setNavigation({
          location: 'home'
        })
        setIsSendTxnPending(false) // Set pending to false immediately after getting hash

        analytics?.track({
          event: 'SEND_TRANSACTION_REQUEST',
          props: {
            walletClient: (connector as ExtendedConnector | undefined)?._wallet?.id || 'unknown',
            source: EVENT_SOURCE,
            type: EVENT_TYPES.SEND_CURRENCY,
            chainId: String(chainId),
            origin: window.location.origin,
            currencySymbol: symbol,
            currencyAddress: contractAddress,
            txHash: txHash
          },
          nums: {
            currencyValue: Number(amountRaw),
            currencyValueDecimal: Number(amountToSendFormatted)
          }
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
            })
            .catch(error => {
              console.error('Error waiting for transaction receipt:', error)
            })
        }
      } else {
        // Handle case where txHash is unexpectedly undefined
        setIsSendTxnPending(false)
        setErrorMsg('Transaction submitted but no hash received.')
      }
    } catch (error: any) {
      console.error('Transaction failed:', error)
      setIsSendTxnPending(false)
      setIsBackButtonEnabled(true)
      setErrorMsg(error?.shortMessage || error?.message || 'An unknown error occurred.')
    }
  }

  const handleConfirmationSubmit = () => {
    if (!activeFeeConfirmation) {
      executeTransaction()
      return
    }

    if (!selectedFeeTokenAddress) {
      return
    }

    const selectedOption = activeFeeConfirmation.options.find(
      option => (option.token.contractAddress ?? zeroAddress) === selectedFeeTokenAddress
    )

    if (!selectedOption) {
      console.error('Unable to resolve the selected fee option.')
      return
    }

    if (isWaasConnectorActive) {
      const feeTokenAddress = selectedFeeTokenAddress === zeroAddress ? null : selectedFeeTokenAddress
      confirmWaasFeeOption(activeFeeConfirmation.id, feeTokenAddress)
      return
    }

    if (!selectedOption.token.contractAddress) {
      console.error('Unable to resolve the selected fee option.')
      return
    }

    confirmV3FeeOption(activeFeeConfirmation.id, selectedOption.token.contractAddress)
  }

  const handleConfirmationCancel = () => {
    if (activeFeeConfirmation) {
      if (isWaasConnectorActive) {
        rejectWaasFeeOption(activeFeeConfirmation.id)
      } else if (isSequenceV3ConnectorActive) {
        rejectV3FeeOption(activeFeeConfirmation.id)
      }
    }

    setSelectedFeeTokenAddress(null)
    setIsSendTxnPending(false)
  }

  return (
    <form className="flex px-4 pb-4 gap-2 flex-col" onSubmit={handleSendClick}>
      {!isConfirmationVisible && (
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
              name="amount"
              value={amount}
              onChange={handleChangeAmount}
              controls={
                <>
                  <Text className="whitespace-nowrap" variant="small" color="muted">
                    {`~${fiatCurrency.sign}${amountToSendFiat}`}
                  </Text>
                  <Button className="shrink-0" size="xs" shape="square" label="Max" onClick={handleMax} data-id="maxCoin" />
                </>
              }
            />
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
                  placeholder={`Wallet Address (0x...)`}
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
                {wallets.length > 1 && <AllButActiveWalletSelect onClick={setToAddress} />}
              </>
            )}
          </div>
          {errorMsg && (
            <Text variant="normal" color="negative" fontWeight="bold">
              {errorMsg}
            </Text>
          )}

          <div className="flex items-center justify-center mt-2" style={{ height: '52px' }}>
            {isSendTxnPending ? (
              <Spinner />
            ) : (
              <Button
                className="text-primary w-full"
                variant="primary"
                size="lg"
                type="submit"
                disabled={!isNonZeroAmount || !isEthAddress(toAddress) || insufficientFunds || isSendTxnPending}
                label="Send"
                rightIcon={ChevronRightIcon}
              />
            )}
          </div>
        </>
      )}
      {isConfirmationVisible && (
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
          isLoading={false}
          disabled={!isCorrectChainId && !isConnectorSequenceBased}
          onConfirm={handleConfirmationSubmit}
          onCancel={handleConfirmationCancel}
        />
      )}
    </form>
  )
}
