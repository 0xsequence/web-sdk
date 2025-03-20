import { ContractInfo, TokenMetadata } from '@0xsequence/metadata'
import { networkImageUrl } from '@0xsequence/design-system'
import { findSupportedNetwork } from '@0xsequence/network'
import { formatDisplay, NetworkBadge } from '@0xsequence/connect'
import { useGetCoinPrices } from '@0xsequence/hooks'
import { ReactNode } from 'react'
import { formatUnits } from 'viem'
import { Collectible } from '../../contexts/SelectPaymentModal'

export interface UseOrderSummaryArgs {
  chain: string | number
  currencyAddress: string
  totalPriceRaw: string
  collectibles: Collectible[]
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
  totalPriceFiat: string
  networkName: string
  networkImageUrl: string
  networkBadge: ReactNode
  collectibleItems: CollectibleItem[]
}

export interface UseOrderSummaryReturn {
  error: Error | null
  data: UseOrderSummaryData | null
  isLoading: boolean
}

export const useOrderSummary =
  ({
    chain,
    currencyAddress,
    totalPriceRaw,
    collectibles,
    collectionAddress,
    currencyInfo,
    tokenMetadatas,
    dataCollectionInfo,
    isLoadingCollectionInfo,
    errorCollectionInfo,
    isLoadingTokenMetadatas,
    errorTokenMetadata,
    isLoadingCurrencyInfo,
    errorCurrencyInfo
  }: UseOrderSummaryArgs): (() => UseOrderSummaryReturn) =>
  () => {
    const network = findSupportedNetwork(chain)
    const chainId = network?.chainId || 137

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
      const formattedPrice = formatUnits(BigInt(totalPriceRaw), currencyInfo?.decimals || 0)
      const displayPrice = formatDisplay(formattedPrice, {
        disableScientificNotation: true,
        disableCompactNotation: true,
        significantDigits: 6
      })

      const fiatExchangeRate = dataCoinPrices?.[0].price?.value || 0
      const priceFiat = (fiatExchangeRate * Number(formattedPrice)).toFixed(2)

      data = {
        formattedCryptoPrice: displayPrice,
        cryptoSymbol: currencyInfo?.symbol || 'POL',
        networkName: network?.name || 'Polygon',
        networkImageUrl: networkImageUrl(network?.chainId || 137),
        networkBadge: <NetworkBadge chainId={chainId} />,
        totalPriceFiat: priceFiat,
        collectibleItems: collectibles.map(c => {
          const tokenMetadata = tokenMetadatas?.find(t => t.tokenId === c.tokenId)
          const formattedQuantity = formatUnits(BigInt(c.quantity), tokenMetadata?.decimals || 0)
          return {
            quantityRaw: c.quantity,
            quantityFormatted: formattedQuantity,
            collectionName: dataCollectionInfo?.name || 'Unknown Collection',
            collectibleName: tokenMetadata?.name || 'Unknown Item',
            collectibleImageUrl: tokenMetadata?.image || ''
          }
        })
      }
    }

    return { isLoading, error, data }
  }
