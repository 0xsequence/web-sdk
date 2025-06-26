import { CollectibleTileImage, formatDisplay } from '@0xsequence/connect'
import { Spinner, Text, TokenImage } from '@0xsequence/design-system'
import { useGetCoinPrices, useGetContractInfo, useGetTokenMetadata } from '@0xsequence/hooks'
import { findSupportedNetwork } from '@0xsequence/network'
import { formatUnits } from 'viem'

import { useSelectPaymentModal } from '../../../../hooks/useSelectPaymentModal.js'

export const OrderSummary = () => {
  const { selectPaymentSettings } = useSelectPaymentModal()
  const chain = selectPaymentSettings!.chain
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const collectionAddress = selectPaymentSettings!.collectionAddress
  const tokenIds = selectPaymentSettings?.collectibles.map(c => c.tokenId || '') || []
  const { data: tokenMetadatas, isLoading: isLoadingTokenMetadatas } = useGetTokenMetadata(
    {
      chainID: String(chainId),
      contractAddress: collectionAddress,
      tokenIDs: tokenIds.some(id => id === '') ? [] : tokenIds
    },
    {
      disabled: tokenIds.some(id => id === '')
    }
  )
  const { data: dataCollectionInfo, isLoading: isLoadingCollectionInfo } = useGetContractInfo({
    chainID: String(chainId),
    contractAddress: selectPaymentSettings!.collectionAddress
  })

  const { data: dataCurrencyInfo, isLoading: isLoadingCurrencyInfo } = useGetContractInfo({
    chainID: String(chainId),
    contractAddress: selectPaymentSettings!.currencyAddress
  })
  const { data: dataCoinPrices, isLoading: isLoadingCoinPrices } = useGetCoinPrices([
    {
      chainId,
      contractAddress: selectPaymentSettings!.currencyAddress
    }
  ])

  const isTokenIdUnknown = tokenIds.some(id => id === '')

  const isLoading =
    (isLoadingTokenMetadatas && !isTokenIdUnknown) || isLoadingCollectionInfo || isLoadingCurrencyInfo || isLoadingCoinPrices

  if (isLoading) {
    return (
      <div className="flex mb-2 gap-3" style={{ height: '72px' }}>
        <Spinner />
      </div>
    )
  }

  const formattedPrice = formatUnits(BigInt(selectPaymentSettings!.price), dataCurrencyInfo?.decimals || 0)
  const displayPrice = formatDisplay(formattedPrice, {
    disableScientificNotation: true,
    disableCompactNotation: true,
    significantDigits: 6
  })

  const fiatExchangeRate = dataCoinPrices?.[0].price?.value || 0
  const priceFiat = (fiatExchangeRate * Number(formattedPrice)).toFixed(2)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row gap-1">
        {selectPaymentSettings!.collectibles.map(collectible => {
          const collectibleQuantity = Number(formatUnits(BigInt(collectible.quantity), Number(collectible.decimals || 0)))
          const tokenMetadata = tokenMetadatas?.find(tokenMetadata => tokenMetadata.tokenId === collectible.tokenId)

          return (
            <div className="flex gap-2 items-center" key={collectible.tokenId}>
              <div className="rounded-xl h-[56px] w-[56px]">
                <CollectibleTileImage
                  imageUrl={
                    isTokenIdUnknown
                      ? dataCollectionInfo?.extensions?.ogImage || dataCollectionInfo?.logoURI
                      : tokenMetadata?.image
                  }
                  networkImage={chainId}
                />
              </div>
              <div className="flex flex-col gap-0.25">
                {!isTokenIdUnknown && (
                  <Text variant="xsmall" color="secondary" fontWeight="bold">
                    {`${tokenMetadata?.name || 'Collectible'}(${collectibleQuantity > 1 ? `${collectibleQuantity} items` : '1 item'})`}
                  </Text>
                )}
                <Text variant="xsmall" color="secondary" fontWeight="normal">
                  {dataCollectionInfo?.name || null}
                </Text>
                <div className="flex flex-row gap-1 items-center">
                  <TokenImage src={dataCurrencyInfo?.logoURI} size="xs" />
                  <Text color="white" variant="xsmall" fontWeight="normal">
                    {`${displayPrice} ${dataCurrencyInfo?.symbol} on ${network?.title}`}
                  </Text>
                </div>
                <Text color="text50" variant="xsmall" fontWeight="normal">
                  {`$${priceFiat} USD`}
                </Text>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
