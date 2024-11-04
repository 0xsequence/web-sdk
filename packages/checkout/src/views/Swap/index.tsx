import { useState } from 'react'
import { Box, Button, Spinner, Text } from '@0xsequence/design-system'
import {
  compareAddress,
  formatDisplay,
  useContractInfo,
  useSwapPrices,
  useSwapQuote,
  NATIVE_TOKEN_ADDRESS_0X
} from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'
import { zeroAddress, formatUnits } from 'viem'
import { useAccount } from 'wagmi'

import { ClickableOption } from './ClickableOption'
import { HEADER_HEIGHT } from '../../constants'
import { useSwapModal } from '../../hooks'

export const Swap = () => {
  const { swapModalSettings } = useSwapModal()
  const { currencyAddress, currencyAmount, chainId, disableMainCurrency = false, description } = swapModalSettings!
  const { address: userAddress } = useAccount()
  const [isTxsPending, setIsTxsPending] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<string>()

  const buyCurrencyAddress = compareAddress(currencyAddress, zeroAddress) ? NATIVE_TOKEN_ADDRESS_0X : currencyAddress

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

  const sellCurrency0x = compareAddress(selectedCurrency || '', zeroAddress) ? NATIVE_TOKEN_ADDRESS_0X : selectedCurrency
  const isNativeCurrency = compareAddress(currencyAddress, zeroAddress)
  const network = findSupportedNetwork(chainId)

  const mainCurrencyName = isNativeCurrency ? network?.nativeToken.name : currencyInfoData?.name
  const mainCurrencyLogo = isNativeCurrency ? network?.logoURI : currencyInfoData?.logoURI
  const mainCurrencySymbol = isNativeCurrency ? network?.nativeToken.symbol : currencyInfoData?.symbol
  const mainCurrencyDecimals = isNativeCurrency ? network?.nativeToken.decimals : currencyInfoData?.decimals

  const { data: swapQuote, isLoading: isLoadingSwapQuote } = useSwapQuote(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress: currencyAddress,
      buyAmount: currencyAmount,
      chainId: chainId,
      sellCurrencyAddress: sellCurrency0x || '',
      includeApprove: true
    },
    {
      disabled: !selectedCurrency
    }
  )

  const isMainCurrencySelected = compareAddress(currencyAddress, zeroAddress)
  const quoteFetchInProgress = isLoadingSwapQuote && !isMainCurrencySelected

  const isLoading = isLoadingCurrencyInfo || swapPricesIsLoading

  const onClickProceed = () => {
    setIsTxsPending(true)
    console.log('swapQuote..', swapQuote)
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
              <ClickableOption
                key={currencyAddress}
                price={formattedPrice}
                logoURI={mainCurrencyLogo}
                symbol={mainCurrencySymbol || ''}
                isSelected={compareAddress(selectedCurrency || '', currencyAddress)}
                onClick={() => {
                  setSelectedCurrency(currencyAddress)
                }}
                isDisabled={isTxsPending}
              />
            )}
            {swapPrices.map(swapPrice => {
              const sellCurrencyAddress = compareAddress(swapPrice.info?.address || '', NATIVE_TOKEN_ADDRESS_0X)
                ? zeroAddress
                : swapPrice.info?.address || ''

              const formattedPrice = formatDisplay(formatUnits(BigInt(swapPrice.price.price), swapPrice.info?.decimals || 0))

              return (
                <ClickableOption
                  key={sellCurrencyAddress}
                  symbol={swapPrice.info?.symbol || ''}
                  isSelected={compareAddress(selectedCurrency || '', sellCurrencyAddress)}
                  logoURI={swapPrice.info?.logoURI}
                  price={formattedPrice}
                  onClick={() => setSelectedCurrency(sellCurrencyAddress)}
                  isDisabled={isTxsPending}
                />
              )
            })}
          </Box>
          <Button
            disabled={noOptionsFound || !selectedCurrency || quoteFetchInProgress}
            variant="primary"
            label="Proceed"
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
