import { CryptoOption, compareAddress, formatDisplay, sendTransactions } from '@0xsequence/connect'
import { Button, Spinner, Text } from '@0xsequence/design-system'
import {
  useGetContractInfo,
  useGetSwapOptions,
  useGetSwapQuote,
  useGetTokenBalancesSummary,
  useIndexerClient
} from '@0xsequence/hooks'
import { findSupportedNetwork } from '@0xsequence/network'
import { useState, useEffect } from 'react'
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
    data: swapOptions = [],
    isLoading: swapOptionsIsLoading,
    isError: isErrorSwapOptions
  } = useGetSwapOptions({
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
      contractWhitelist: swapOptions.map(option => option.address)
    }
  })

  const tokenBalancesMap = new Map<string, string>()
  tokenBalances?.pages.forEach(page => {
    page.balances.forEach(balance => {
      tokenBalancesMap.set(balance.contractAddress, balance.balance)
    })
  })

  useEffect(() => {
    if (!disableMainCurrency) {
      setSelectedCurrency(toTokenAddress)
    } else if (!swapOptionsIsLoading) {
      const firstOptionAddress = swapOptions?.[0]?.address
      setSelectedCurrency(firstOptionAddress)
    }
  }, [swapOptionsIsLoading])

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
        slippageBps: 100
      }
    },
    {
      disabled: disableSwapQuote
    }
  )

  const indexerClient = useIndexerClient(chainId)
  const isMainCurrencySelected = compareAddress(selectedCurrency || '', toTokenAddress)
  const quoteFetchInProgress = isLoadingSwapQuote && !isMainCurrencySelected
  const isLoading = isLoadingCurrencyInfo || swapOptionsIsLoading

  const onClickProceed = async () => {
    if (!userAddress || !publicClient || !walletClient || !connector) {
      return
    }

    setIsError(false)
    setIsTxsPending(true)

    try {
      const swapOption = swapOptions?.find(option => option.address === selectedCurrency)
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

  const isErrorFetchingOptions = isErrorSwapOptions || isErrorCurrencyInfo
  const noOptionsFound = disableMainCurrency && swapOptions.length === 0

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
            {swapOptions.map(tokenOption => {
              const displayPrice = formatUnits(BigInt(tokenOption.price || '0'), tokenOption.decimals || 0)
              const balance = tokenBalancesMap.get(tokenOption.address.toLowerCase())
              const insufficientFunds = balance ? BigInt(balance) < BigInt(tokenOption.price || '0') : false

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
            label={quoteFetchInProgress ? 'Preparing swap...' : 'Proceed'}
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
