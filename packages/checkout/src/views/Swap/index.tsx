import { useState } from 'react'
import { Hex, formatUnits, zeroAddress } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { useSwapModal, useTransactionStatusModal } from '../../hooks'

import { Box, Button, Spinner, Text } from '@0xsequence/design-system'
import {
  CryptoOption,
  compareAddress,
  formatDisplay,
  sendTransactions,
  useIndexerClient
} from '@0xsequence/kit'
import { useGetContractInfo } from '@0xsequence/kit-hooks'
import { useGetSwapPrices, useGetSwapQuote } from '@0xsequence/kit-hooks'
import { findSupportedNetwork } from '@0xsequence/network'

export const Swap = () => {
  const { openTransactionStatusModal } = useTransactionStatusModal()
  const { swapModalSettings, closeSwapModal } = useSwapModal()
  const {
    currencyAddress,
    currencyAmount,
    chainId,
    disableMainCurrency = true,
    description,
    postSwapTransactions,
    blockConfirmations,
    onSuccess = () => {}
  } = swapModalSettings!
  const { address: userAddress, connector } = useAccount()
  const [isTxsPending, setIsTxsPending] = useState(false)
  const [isError, setIsError] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<string>()
  const publicClient = usePublicClient({ chainId })
  const { data: walletClient } = useWalletClient({ chainId })

  const buyCurrencyAddress = currencyAddress
  const sellCurrencyAddress = selectedCurrency || ''

  const {
    data: currencyInfoData,
    isLoading: isLoadingCurrencyInfo,
    isError: isErrorCurrencyInfo
  } = useGetContractInfo({ chainID: String(chainId), contractAddress: currencyAddress })

  const {
    data: swapPrices = [],
    isLoading: swapPricesIsLoading,
    isError: isErrorPrices
  } = useGetSwapPrices(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress,
      chainId: chainId,
      buyAmount: currencyAmount,
      withContractInfo: true
    },
    { disabled: false }
  )

  const isNativeCurrency = compareAddress(currencyAddress, zeroAddress)
  const network = findSupportedNetwork(chainId)

  const mainCurrencyName = isNativeCurrency ? network?.nativeToken.name : currencyInfoData?.name
  const mainCurrencyLogo = isNativeCurrency ? network?.logoURI : currencyInfoData?.logoURI
  const mainCurrencySymbol = isNativeCurrency ? network?.nativeToken.symbol : currencyInfoData?.symbol
  const mainCurrencyDecimals = isNativeCurrency ? network?.nativeToken.decimals : currencyInfoData?.decimals

  const disableSwapQuote = !selectedCurrency || compareAddress(selectedCurrency, buyCurrencyAddress)

  const {
    data: swapQuote,
    isLoading: isLoadingSwapQuote,
    isError: isErrorSwapQuote
  } = useGetSwapQuote(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress: currencyAddress,
      buyAmount: currencyAmount,
      chainId: chainId,
      sellCurrencyAddress,
      includeApprove: true
    },
    {
      disabled: disableSwapQuote
    }
  )

  const indexerClient = useIndexerClient(chainId)

  const isMainCurrencySelected = compareAddress(selectedCurrency || '', currencyAddress)
  const quoteFetchInProgress = isLoadingSwapQuote && !isMainCurrencySelected

  const isLoading = isLoadingCurrencyInfo || swapPricesIsLoading

  const onClickProceed = async () => {
    if (!userAddress || !publicClient || !walletClient || !connector) {
      return
    }

    setIsError(false)
    setIsTxsPending(true)

    try {
      const swapPrice = swapPrices?.find(price => price.info?.address === selectedCurrency)
      const isSwapNativeToken = compareAddress(zeroAddress, swapPrice?.price.currencyAddress || '')

      const getSwapTransactions = () => {
        if (isMainCurrencySelected || !swapQuote || !swapPrice) {
          return []
        }

        const swapTransactions = [
          // Swap quote optional approve step
          ...(swapQuote?.approveData && !isSwapNativeToken
            ? [
                {
                  to: swapPrice.price.currencyAddress as Hex,
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

  const isErrorFetchingPrices = isErrorPrices || isErrorCurrencyInfo
  const noOptionsFound = disableMainCurrency && swapPrices.length === 0

  const SwapContent = () => {
    if (isLoading) {
      return (
        <Box width="full" justifyContent="center" alignItems="center">
          <Spinner />
        </Box>
      )
    } else if (isErrorFetchingPrices) {
      return (
        <Box width="full" justifyContent="center" alignItems="center">
          <Text variant="normal" color="negative">
            An error occurred while fetching the swap options.
          </Text>
        </Box>
      )
    } else if (noOptionsFound) {
      return (
        <Box width="full" justifyContent="center" alignItems="center">
          <Text variant="normal">No swap option found!</Text>
        </Box>
      )
    } else {
      const formattedPrice = formatUnits(BigInt(currencyAmount), mainCurrencyDecimals || 0)
      const displayPrice = formatDisplay(formattedPrice, {
        disableScientificNotation: true,
        disableCompactNotation: true,
        significantDigits: 6
      })

      return (
        <Box width="full" gap="3" flexDirection="column">
          <Text variant="normal" color="text100">
            {description}
          </Text>
          <Box width="full" flexDirection="column" gap="2">
            {!disableMainCurrency && (
              <CryptoOption
                key={currencyAddress}
                chainId={chainId}
                currencyName={mainCurrencyName || mainCurrencySymbol || ''}
                price={displayPrice}
                iconUrl={mainCurrencyLogo}
                symbol={mainCurrencySymbol || ''}
                isSelected={compareAddress(selectedCurrency || '', currencyAddress)}
                onClick={() => {
                  setIsError(false)
                  setSelectedCurrency(currencyAddress)
                }}
                disabled={isTxsPending}
              />
            )}
            {swapPrices.map(swapPrice => {
              const sellCurrencyAddress = swapPrice.info?.address || ''

              const formattedPrice = formatUnits(BigInt(swapPrice.price.price), swapPrice.info?.decimals || 0)
              const displayPrice = formatDisplay(formattedPrice, {
                disableScientificNotation: true,
                disableCompactNotation: true,
                significantDigits: 6
              })
              return (
                <CryptoOption
                  key={sellCurrencyAddress}
                  chainId={chainId}
                  currencyName={swapPrice.info?.name || swapPrice.info?.symbol || ''}
                  symbol={swapPrice.info?.symbol || ''}
                  isSelected={compareAddress(selectedCurrency || '', sellCurrencyAddress)}
                  iconUrl={swapPrice.info?.logoURI}
                  price={displayPrice}
                  onClick={() => {
                    setIsError(false)
                    setSelectedCurrency(sellCurrencyAddress)
                  }}
                  disabled={isTxsPending}
                />
              )
            })}
          </Box>
          {isError && (
            <Box width="full">
              <Text color="negative" variant="small">
                A problem occurred while executing the transaction.
              </Text>
            </Box>
          )}
          {isErrorSwapQuote && (
            <Box width="full">
              <Text color="negative" variant="small">
                A problem occurred while fetching the swap quote.
              </Text>
            </Box>
          )}
          <Button
            disabled={
              noOptionsFound || !selectedCurrency || quoteFetchInProgress || isTxsPending || isErrorSwapQuote
            }
            variant="primary"
            label={quoteFetchInProgress ? 'Preparing swap...' : 'Proceed'}
            onClick={onClickProceed}
          />
        </Box>
      )
    }
  }

  return (
    <Box
      flexDirection="column"
      gap="2"
      alignItems="flex-start"
      paddingBottom="6"
      paddingX="6"
      style={{
        paddingTop: HEADER_HEIGHT
      }}
    >
      <SwapContent />
    </Box>
  )
}
