import { compareAddress, formatDisplay, NetworkBadge } from '@0xsequence/connect'
import { networkImageUrl } from '@0xsequence/design-system'
import { useGetCoinPrices } from '@0xsequence/hooks'
import { ContractInfo, TokenMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork } from '@0xsequence/network'
import { ReactNode } from 'react'
import { formatUnits, zeroAddress } from 'viem'

import { Collectible } from '../../contexts/SelectPaymentModal'

export interface UseOrderSummaryArgs {
  chain: string | number
  currencyAddress: string
  totalPriceRaw: string
  collectible: Collectible
  collectionAddress: string
  currencyInfo: ContractInfo | undefined
  tokenMetadatas: TokenMetadata[] | undefined
  dataCollectionInfo: ContractInfo | undefined
  isLoadingCollectionInfo: boolean
  errorCollectionInfo: Error | null
  isLoadingTokenMetadatas: boolean
  errorTokenMetadata: Error | null
  isLoadingCurrencyInfo: boolean
  errorCurrencyInfo: Error | null
}

export interface UseOrderSummaryConfig {}

export interface CollectibleItem {
  quantityRaw: string
  quantityFormatted: string
  collectionName: string
  collectibleName: string
  collectibleImageUrl: string
}

export interface UseOrderSummaryData {
  formattedCryptoPrice: string
  cryptoSymbol: string
  cryptoImageUrl?: string
  totalPriceFiat: string
  networkName: string
  networkImageUrl: string
  NetworkBadge: ReactNode
  collectibleItem: CollectibleItem
}

export interface UseOrderSummaryReturn {
  error: Error | null
  data: UseOrderSummaryData | null
  isLoading: boolean
}

export const useOrderSummary = ({
  chain,
  currencyAddress,
  totalPriceRaw,
  collectible,
  currencyInfo,
  tokenMetadatas,
  dataCollectionInfo,
  isLoadingCollectionInfo,
  errorCollectionInfo,
  isLoadingTokenMetadatas,
  errorTokenMetadata,
  isLoadingCurrencyInfo,
  errorCurrencyInfo
}: UseOrderSummaryArgs): UseOrderSummaryReturn => {
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const isNativeCurrency = compareAddress(currencyAddress, zeroAddress)
  const currencySymbol = isNativeCurrency ? network?.nativeToken.symbol : currencyInfo?.symbol
  const currencyDecimals = isNativeCurrency ? network?.nativeToken.decimals : currencyInfo?.decimals
  const cryptoImageUrl = isNativeCurrency ? network?.logoURI : currencyInfo?.logoURI

  const {
    data: dataCoinPrices,
    isLoading: isLoadingCoinPrices,
    error: errorCoinPrices
  } = useGetCoinPrices([
    {
      chainId,
      contractAddress: currencyAddress
    }
  ])

  const isLoading = isLoadingCurrencyInfo || isLoadingTokenMetadatas || isLoadingCoinPrices || isLoadingCollectionInfo
  const error = errorTokenMetadata || errorCurrencyInfo || errorCoinPrices || errorCollectionInfo

  let data = null

  if (!isLoading && !error) {
    const formattedPrice = formatUnits(BigInt(totalPriceRaw), currencyDecimals || 18)
    const displayPrice = formatDisplay(formattedPrice, {
      disableScientificNotation: true,
      disableCompactNotation: true,
      significantDigits: 6
    })

    const fiatExchangeRate = dataCoinPrices?.[0].price?.value || 0
    const priceFiat = (fiatExchangeRate * Number(formattedPrice)).toFixed(2)
    const tokenMetadata = tokenMetadatas?.find(t => t.tokenId === collectible.tokenId)
    const formattedQuantity = formatUnits(BigInt(collectible.quantity), tokenMetadata?.decimals || 0)

    data = {
      formattedCryptoPrice: displayPrice,
      cryptoSymbol: currencySymbol || 'POL',
      cryptoImageUrl: cryptoImageUrl,
      networkName: network?.name || 'Polygon',
      networkImageUrl: networkImageUrl(network?.chainId || 137),
      NetworkBadge: <NetworkBadge chainId={chainId} />,
      totalPriceFiat: priceFiat,
      collectibleItem: {
        quantityRaw: collectible.quantity,
        quantityFormatted: formattedQuantity,
        collectionName: dataCollectionInfo?.name || 'Unknown Collection',
        collectibleName: tokenMetadata?.name || 'Unknown Item',
        collectibleImageUrl: tokenMetadata?.image || ''
      }
    }
  }

  return { isLoading, error, data }
}
