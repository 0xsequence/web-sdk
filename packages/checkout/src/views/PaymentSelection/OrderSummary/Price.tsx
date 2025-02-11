import { Spinner, Text, TokenImage } from '@0xsequence/design-system';
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
      (<div className="flex my-2 px-6 justify-center items-center w-full h-12">
        <Spinner />
      </div>)
    );
  }

  const tokenLogo = currencyInfo?.logoURI
  const tokenSymbol = currencyInfo?.symbol
  const tokenDecimals = currencyInfo?.decimals
  const formattedPrice = formatUnits(fullPrice, tokenDecimals || 0)
  const fiatConversionRate = coinPricesData?.[0].price?.value || 0

  const priceFiat = fiatConversionRate * Number(formattedPrice)
  const priceFiatFormatted = `~${Number(priceFiat).toFixed(2)} USD`

  return (
    (<div className="flex px-6 justify-between items-center w-full h-12">
      <div>
        <Text variant="small" color="text50" fontWeight="medium">
          Price
        </Text>
      </div>
      <div className="flex flex-col justify-between items-end">
        <div className="flex gap-2 items-center">
          <TokenImage className="w-5" src={tokenLogo} />
          <Text variant="large" fontWeight="bold" color="text100">{`${formattedPrice} ${tokenSymbol}`}</Text>
        </div>
        <div>
          <Text variant="normal" fontWeight="medium" color="text50">
            {priceFiatFormatted}
          </Text>
        </div>
      </div>
    </div>)
  );
}
