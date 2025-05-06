import { CryptoOption, compareAddress, formatDisplay, sendTransactions } from '@0xsequence/connect'
import { Button, Spinner, Text } from '@0xsequence/design-system'
import {
  useGetContractInfo,
  useGetSwapRoutes,
  useGetSwapQuote,
  useGetTokenBalancesSummary,
  useIndexerClient
} from '@0xsequence/hooks'
import { findSupportedNetwork } from '@0xsequence/network'
import { useState, useEffect, useMemo } from 'react'
import { zeroAddress, formatUnits, Hex } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { useSwapModal, useTransactionStatusModal } from '../../hooks'

export const Swap = () => {
  const { openTransactionStatusModal } = useTransactionStatusModal()
  const { swapModalSettings, closeSwapModal } = useSwapModal()
  const {
    toTokenAddress,
    toTokenAmount,
    chainId,
    disableMainCurrency = true,
    description,
    slippageBps,
    postSwapTransactions,
    blockConfirmations,
    customSwapErrorMessage,
    onSuccess = () => {}
  } = swapModalSettings!
  const { address: userAddress, connector } = useAccount()
  const [isTxsPending, setIsTxsPending] = useState(false)
  const [isError, setIsError] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<string>()
  const publicClient = usePublicClient({ chainId })
  const { data: walletClient } = useWalletClient({ chainId })

  const {
    data: currencyInfoData,
    isLoading: isLoadingCurrencyInfo,
    isError: isErrorCurrencyInfo
  } = useGetContractInfo({ chainID: String(chainId), contractAddress: toTokenAddress })

  const {
    data: swapRoutes = [],
    isLoading: swapRoutesIsLoading,
    isError: isErrorSwapRoutes
  } = useGetSwapRoutes({
    chainId,
    toTokenAddress,
    toTokenAmount,
    walletAddress: userAddress ?? ''
  })

  const { data: tokenBalances, isLoading: isLoadingTokenBalances } = useGetTokenBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: [userAddress ?? ''],
      omitNativeBalances: false,
      contractWhitelist: swapRoutes.flatMap(route => route.fromTokens).map(fromToken => fromToken.address)
    }
  })

  const tokensBalancesMap = useMemo(() => {
    const map = new Map<string, bigint>()
    tokenBalances?.pages?.forEach(page => {
      page.balances?.forEach(balanceData => {
        if (balanceData.contractAddress && balanceData.balance) {
          map.set(balanceData.contractAddress.toLowerCase(), BigInt(balanceData.balance))
        }
      })
    })
    return map
  }, [tokenBalances])

  useEffect(() => {
    // Only attempt to select a currency if none is currently selected
    const selectedCurrencyBalance = tokensBalancesMap.get(selectedCurrency?.toLowerCase() || '')
    if ((selectedCurrency && BigInt(selectedCurrencyBalance || '0') > 0) || isLoadingTokenBalances || swapRoutesIsLoading) {
      return
    }

    if (!disableMainCurrency) {
      const balance = tokensBalancesMap.get(toTokenAddress.toLowerCase())
      const mainCurrencyOptionPrice = toTokenAmount

      if (mainCurrencyOptionPrice && balance && BigInt(balance) >= BigInt(mainCurrencyOptionPrice)) {
        setSelectedCurrency(toTokenAddress)
        return
      }
    }

    const validSwapOptions = swapRoutes.flatMap(route => route.fromTokens)

    if (!validSwapOptions.length) {
      return
    }

    // Try to find the first token with sufficient balance
    const optionWithSufficientBalance = validSwapOptions.find(option => {
      if (!option.price) {
        return false
      }
      const balance = tokensBalancesMap.get(option.address.toLowerCase())
      return balance ? BigInt(balance) >= BigInt(option.price) : false
    })

    if (optionWithSufficientBalance) {
      setSelectedCurrency(optionWithSufficientBalance.address)
    }
  }, [
    swapRoutesIsLoading,
    isLoadingTokenBalances,
    swapRoutes,
    tokensBalancesMap,
    disableMainCurrency,
    toTokenAddress,
    selectedCurrency
  ])

  const isNativeCurrency = compareAddress(toTokenAddress, zeroAddress)
  const network = findSupportedNetwork(chainId)

  const mainCurrencyName = isNativeCurrency ? network?.nativeToken.name : currencyInfoData?.name
  const mainCurrencyLogo = isNativeCurrency ? network?.logoURI : currencyInfoData?.logoURI
  const mainCurrencySymbol = isNativeCurrency ? network?.nativeToken.symbol : currencyInfoData?.symbol
  const mainCurrencyDecimals = isNativeCurrency ? network?.nativeToken.decimals : currencyInfoData?.decimals

  const disableSwapQuote = !selectedCurrency || compareAddress(selectedCurrency, toTokenAddress)

  const {
    data: swapQuote,
    isLoading: isLoadingSwapQuote,
    isError: isErrorSwapQuote
  } = useGetSwapQuote(
    {
      params: {
        walletAddress: userAddress ?? '',
        toTokenAddress,
        toTokenAmount,
        fromTokenAddress: selectedCurrency || '',
        chainId: chainId,
        includeApprove: true,
        slippageBps: slippageBps || 100
      }
    },
    {
      disabled: disableSwapQuote
    }
  )

  const indexerClient = useIndexerClient(chainId)
  const isMainCurrencySelected = compareAddress(selectedCurrency || '', toTokenAddress)
  const quoteFetchInProgress = isLoadingSwapQuote && !isMainCurrencySelected
  const isLoading = isLoadingCurrencyInfo || swapRoutesIsLoading

  const onClickProceed = async () => {
    if (!userAddress || !publicClient || !walletClient || !connector) {
      return
    }

    setIsError(false)
    setIsTxsPending(true)

    try {
      const swapOption = swapRoutes.flatMap(route => route.fromTokens).find(option => option.address === selectedCurrency)
      const isSwapNativeToken = compareAddress(zeroAddress, swapOption?.address || '')

      const getSwapTransactions = () => {
        if (isMainCurrencySelected || !swapQuote || !swapOption) {
          return []
        }

        const swapTransactions = [
          // Swap quote optional approve step
          ...(swapQuote?.approveData && !isSwapNativeToken
            ? [
                {
                  to: swapOption.address as Hex,
                  data: swapQuote.approveData as Hex,
                  chain: chainId
                }
              ]
            : []),
          // Swap quote tx
          {
            to: swapQuote.to as Hex,
            data: swapQuote.transactionData as Hex,
            chain: chainId,
            ...(isSwapNativeToken
              ? {
                  value: BigInt(swapQuote.transactionValue)
                }
              : {})
          }
        ]
        return swapTransactions
      }

      const walletClientChainId = await walletClient.getChainId()
      if (walletClientChainId !== chainId) {
        await walletClient.switchChain({ id: chainId })
      }

      const txHash = await sendTransactions({
        connector,
        walletClient,
        publicClient,
        chainId,
        indexerClient,
        senderAddress: userAddress,
        transactionConfirmations: blockConfirmations,
        transactions: [...getSwapTransactions(), ...(postSwapTransactions ?? [])]
      })

      closeSwapModal()
      openTransactionStatusModal({
        chainId,
        txHash,
        onSuccess: () => {
          onSuccess(txHash)
        }
      })
    } catch (e) {
      setIsTxsPending(false)
      setIsError(true)
      console.error('Failed to send transactions', e)
    }
  }

  const isErrorFetchingOptions = isErrorSwapRoutes || isErrorCurrencyInfo
  const noOptionsFound = disableMainCurrency && swapRoutes.flatMap(route => route.fromTokens).length === 0

  const SwapContent = () => {
    if (isLoading || isLoadingTokenBalances) {
      return (
        <div className="flex w-full justify-center items-center">
          <Spinner />
        </div>
      )
    } else if (isErrorFetchingOptions) {
      return (
        <div className="flex w-full justify-center items-center">
          <Text variant="normal" color="negative">
            An error occurred while fetching the swap options.
          </Text>
        </div>
      )
    } else if (noOptionsFound) {
      return (
        <div className="flex w-full justify-center items-center">
          <Text variant="normal" color="primary">
            {customSwapErrorMessage ||
              'No swap options found on your wallet, please ensure you hold an eligible token for the swap.'}
          </Text>
        </div>
      )
    } else {
      const formattedPrice = formatUnits(BigInt(toTokenAmount), mainCurrencyDecimals || 0)
      const displayPrice = formatDisplay(formattedPrice, {
        disableScientificNotation: true,
        disableCompactNotation: true,
        significantDigits: 6
      })

      return (
        <div className="flex w-full gap-3 flex-col">
          <Text variant="normal" color="primary">
            {description}
          </Text>
          <div className="flex w-full flex-col gap-2">
            {!disableMainCurrency && (
              <CryptoOption
                key={toTokenAddress}
                chainId={chainId}
                currencyName={mainCurrencyName || mainCurrencySymbol || ''}
                price={displayPrice}
                iconUrl={mainCurrencyLogo}
                symbol={mainCurrencySymbol || ''}
                isSelected={compareAddress(selectedCurrency || '', toTokenAddress)}
                onClick={() => {
                  setIsError(false)
                  setSelectedCurrency(toTokenAddress)
                }}
                disabled={isTxsPending}
              />
            )}
            {swapRoutes
              .flatMap(route => route.fromTokens)
              .map(tokenOption => {
                const displayPrice = formatUnits(BigInt(tokenOption.price || '0'), tokenOption.decimals || 0)
                const balance = tokensBalancesMap.get(tokenOption.address.toLowerCase()) || BigInt(0)
                const insufficientFunds = balance < BigInt(tokenOption.price || '0')

                return (
                  <CryptoOption
                    key={tokenOption.address}
                    chainId={chainId}
                    currencyName={tokenOption.name || tokenOption.symbol || ''}
                    symbol={tokenOption.symbol || ''}
                    isSelected={compareAddress(selectedCurrency || '', tokenOption.address)}
                    iconUrl={tokenOption.logoUri}
                    price={displayPrice}
                    showInsufficientFundsWarning={insufficientFunds}
                    onClick={() => {
                      setIsError(false)
                      setSelectedCurrency(tokenOption.address)
                    }}
                    disabled={isTxsPending}
                  />
                )
              })}
          </div>
          {isError && (
            <div className="w-full">
              <Text color="negative" variant="small">
                A problem occurred while executing the transaction.
              </Text>
            </div>
          )}
          {isErrorSwapQuote && (
            <div className="w-full">
              <Text color="negative" variant="small">
                A problem occurred while fetching the swap quote.
              </Text>
            </div>
          )}
          <Button
            disabled={noOptionsFound || !selectedCurrency || quoteFetchInProgress || isTxsPending || isErrorSwapQuote}
            variant="primary"
            label={quoteFetchInProgress ? 'Preparing swap...' : isTxsPending ? 'Preparing transaction...' : 'Proceed'}
            onClick={onClickProceed}
          />
        </div>
      )
    }
  }

  return (
    <div
      className="flex flex-col gap-2 items-start pb-6 px-6"
      style={{
        paddingTop: HEADER_HEIGHT
      }}
    >
      <SwapContent />
    </div>
  )
}
