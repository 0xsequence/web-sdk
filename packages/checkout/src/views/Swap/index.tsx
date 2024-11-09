import { useState } from 'react'
import { Box, Button, Spinner, Text } from '@0xsequence/design-system'
import { compareAddress, formatDisplay, useContractInfo, useSwapPrices, useSwapQuote, sendTransactions } from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'
import { zeroAddress, formatUnits, Hex } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'

import { CryptoOption } from '../PaymentSelection/PayWithCrypto/CryptoOption'
import { HEADER_HEIGHT } from '../../constants'
import { useSwapModal, useTransactionStatusModal } from '../../hooks'

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
  const { data: walletClient } = useWalletClient()

  const buyCurrencyAddress = currencyAddress
  const sellCurrencyAddress = selectedCurrency || ''

  const { data: currencyInfoData, isLoading: isLoadingCurrencyInfo } = useContractInfo(chainId, currencyAddress)

  const { data: swapPrices = [], isLoading: swapPricesIsLoading } = useSwapPrices(
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

  const { data: swapQuote, isLoading: isLoadingSwapQuote } = useSwapQuote(
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

      const txHash = await sendTransactions({
        connector,
        walletClient,
        publicClient,
        chainId,
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

  const noOptionsFound = disableMainCurrency && swapPrices.length === 0

  const SwapContent = () => {
    if (isLoading) {
      return (
        <Box width="full" justifyContent="center" alignItems="center">
          <Spinner />
        </Box>
      )
    } else if (noOptionsFound) {
      return (
        <Box width="full" justifyContent="center" alignItems="center">
          <Text variant="normal">No swap option found!</Text>
        </Box>
      )
    } else {
      const formattedPrice = formatDisplay(formatUnits(BigInt(currencyAmount), mainCurrencyDecimals || 0))

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
                price={formattedPrice}
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

              const formattedPrice = formatDisplay(formatUnits(BigInt(swapPrice.price.price), swapPrice.info?.decimals || 0))

              return (
                <CryptoOption
                  key={sellCurrencyAddress}
                  chainId={chainId}
                  currencyName={swapPrice.info?.name || swapPrice.info?.symbol || ''}
                  symbol={swapPrice.info?.symbol || ''}
                  isSelected={compareAddress(selectedCurrency || '', sellCurrencyAddress)}
                  iconUrl={swapPrice.info?.logoURI}
                  price={formattedPrice}
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
          <Button
            disabled={noOptionsFound || !selectedCurrency || quoteFetchInProgress || isTxsPending}
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
