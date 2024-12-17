import {
  Box,
  Button,
  ChevronRightIcon,
  CopyIcon,
  CloseIcon,
  GradientAvatar,
  Text,
  NumericInput,
  TextInput,
  vars,
  Spinner,
  Card
} from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import {
  getNativeTokenInfoByChainId,
  useAnalyticsContext,
  ExtendedConnector,
  useExchangeRate,
  useCoinPrices,
  useBalances,
  useCheckWaasFeeOptions,
  useWaasFeeOptions
} from '@0xsequence/kit'
import { ethers } from 'ethers'
import React, { useState, ChangeEvent, useRef, useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain, useConfig, useSendTransaction } from 'wagmi'

import { ERC_20_ABI, HEADER_HEIGHT } from '../constants'
import { useNavigationContext } from '../contexts/Navigation'
import { useSettings, useNavigation } from '../hooks'
import { SendItemInfo } from '../shared/SendItemInfo'
import { TransactionConfirmation } from '../shared/TransactionConfirmation'
import { compareAddress, computeBalanceFiat, limitDecimals, isEthAddress, truncateAtMiddle } from '../utils'

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
  const [pendingFeeOption, confirmFeeOption, rejectFeeOption] = useWaasFeeOptions()

  const { data: balances = [], isPending: isPendingBalances } = useBalances({
    chainIds: [chainId],
    accountAddress: accountAddress,
    contractAddress
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
    <Box
      padding="5"
      paddingTop="3"
      style={{
        marginTop: HEADER_HEIGHT
      }}
      gap="2"
      flexDirection="column"
      as="form"
      onSubmit={handleSendClick}
      pointerEvents={isSendTxnPending ? 'none' : 'auto'}
    >
      {!showConfirmation && (
        <>
          <Box background="backgroundSecondary" borderRadius="md" padding="4" gap="2" flexDirection="column">
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
                  <Text variant="small" color="text50" whiteSpace="nowrap">
                    {`~${fiatCurrency.sign}${amountToSendFiat}`}
                  </Text>
                  <Button size="xs" shape="square" label="Max" onClick={handleMax} data-id="maxCoin" flexShrink="0" />
                  <Text variant="xlarge" fontWeight="bold" color="text100">
                    {symbol}
                  </Text>
                </>
              }
            />
            {insufficientFunds && (
              <Text as="div" variant="normal" color="negative" marginTop="2">
                Insufficient Funds
              </Text>
            )}
          </Box>
          <Box background="backgroundSecondary" borderRadius="md" padding="4" gap="2" flexDirection="column">
            <Text variant="normal" color="text50">
              To
            </Text>
            {isEthAddress(toAddress) ? (
              <Card
                clickable
                width="full"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                onClick={handleToAddressClear}
                style={{ height: '52px' }}
              >
                <Box flexDirection="row" justifyContent="center" alignItems="center" gap="2">
                  <GradientAvatar address={toAddress} style={{ width: '20px' }} />
                  <Text color="text100" variant="normal">{`0x${truncateAtMiddle(toAddress.substring(2), 10)}`}</Text>
                </Box>
                <CloseIcon size="sm" color="white" />
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
                    size="xs"
                    shape="square"
                    label="Paste"
                    onClick={handlePaste}
                    data-id="to-address"
                    flexShrink="0"
                    leftIcon={CopyIcon}
                  />
                }
              />
            )}
          </Box>

          {showSwitchNetwork && (
            <Box marginTop="3">
              <Text variant="small" color="negative" marginBottom="2">
                The wallet is connected to the wrong network. Please switch network before proceeding
              </Text>
              <Button
                marginTop="2"
                width="full"
                variant="primary"
                type="button"
                label="Switch Network"
                onClick={async () => await switchChainAsync({ chainId })}
                disabled={isCorrectChainId}
                style={{ height: '52px', borderRadius: vars.radii.md }}
              />
            </Box>
          )}

          <Box style={{ height: '52px' }} alignItems="center" justifyContent="center">
            {isCheckingFeeOptions ? (
              <Spinner />
            ) : (
              <Button
                color="text100"
                marginTop="3"
                width="full"
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
          </Box>
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
    </Box>
  )
}
