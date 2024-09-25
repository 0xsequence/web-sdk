import { Box, Spinner, Text, TokenImage } from '@0xsequence/design-system'
import { useContractInfo, useCoinPrices } from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'
import { formatUnits } from 'viem'

import { useSelectPaymentModal } from '../../../hooks'

export const Price = () => {
  const { selectPaymentSettings } = useSelectPaymentModal()
  const price = selectPaymentSettings!.price
  const chain = selectPaymentSettings!.chain
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const currencyAddress = selectPaymentSettings!.currencyAddress
  const { data: currencyInfo, isLoading: isLoadingCurrencyInfo } = useContractInfo(chainId, currencyAddress)
  const fullPrice = BigInt(price)
  const { data: coinPricesData, isLoading: isLoadingCoinPrice } = useCoinPrices([
    {
      chainId,
      contractAddress: currencyAddress
    }
  ])

  const isLoading = isLoadingCurrencyInfo || isLoadingCoinPrice

  if (isLoading) {
    return (
      <Box marginY="2" paddingX="6" justifyContent="center" alignItems="center" width="full" height="12">
        <Spinner />
      </Box>
    )
  }

  const tokenLogo = currencyInfo?.logoURI
  const tokenSymbol = currencyInfo?.symbol
  const tokenDecimals = currencyInfo?.decimals
  const formattedPrice = formatUnits(fullPrice, tokenDecimals || 0)
  const fiatConversionRate = coinPricesData?.[0].price?.value || 0

  const priceFiat = fiatConversionRate * Number(formattedPrice)
  const priceFiatFormatted = `~${Number(priceFiat).toFixed(2)} USD`

  return (
    <Box paddingX="6" justifyContent="space-between" alignItems="center" width="full" height="12">
      <Box>
        <Text variant="small" color="text50" fontWeight="medium">
          Price
        </Text>
      </Box>
      <Box flexDirection="column" justifyContent="space-between" alignItems="flex-end">
        <Box gap="2" alignItems="center">
          <TokenImage src={tokenLogo} width="5" />
          <Text variant="large" fontWeight="bold" color="text100">{`${formattedPrice} ${tokenSymbol}`}</Text>
        </Box>
        <Box>
          <Text variant="normal" fontWeight="medium" color="text50">
            {priceFiatFormatted}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
