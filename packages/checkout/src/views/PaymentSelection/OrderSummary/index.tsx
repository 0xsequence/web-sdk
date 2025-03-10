import { Spinner, NetworkImage, Text } from '@0xsequence/design-system'
import { formatDisplay, NetworkBadge, CollectibleTileImage } from '@0xsequence/kit'
import { useGetTokenMetadata, useGetContractInfo, useGetCoinPrices } from '@0xsequence/kit-hooks'
import { findSupportedNetwork } from '@0xsequence/network'
import { formatUnits } from 'viem'

import { useSelectPaymentModal } from '../../../hooks'

export const OrderSummary = () => {
  const { selectPaymentSettings } = useSelectPaymentModal()
  const chain = selectPaymentSettings!.chain
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const collectionAddress = selectPaymentSettings!.collectionAddress
  const tokenIds = selectPaymentSettings?.collectibles.map(c => c.tokenId) || []
  const { data: tokenMetadatas, isLoading: isLoadingTokenMetadatas } = useGetTokenMetadata({
    chainID: String(chainId),
    contractAddress: collectionAddress,
    tokenIDs: tokenIds
  })
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

  const isLoading = isLoadingTokenMetadatas || isLoadingCollectionInfo || isLoadingCurrencyInfo || isLoadingCoinPrices

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

  const totalQuantity =
    selectPaymentSettings?.collectibles.reduce((accumulator, collectible) => {
      const quantity = formatUnits(BigInt(collectible.quantity), Number(collectible.decimals || 0))
      return accumulator + Number(quantity)
    }, 0) || 0

  const fiatExchangeRate = dataCoinPrices?.[0].price?.value || 0
  const priceFiat = (fiatExchangeRate * Number(formattedPrice)).toFixed(2)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Text
          variant="small"
          fontWeight="bold"
          color="primary"
        >{`${totalQuantity} ${totalQuantity > 1 ? 'items' : 'item'}`}</Text>
      </div>
      <div className="flex flex-row gap-1">
        {selectPaymentSettings!.collectibles.map(collectible => {
          const collectibleQuantity = Number(formatUnits(BigInt(collectible.quantity), Number(collectible.decimals || 0)))
          const tokenMetadata = tokenMetadatas?.find(tokenMetadata => tokenMetadata.tokenId === collectible.tokenId)

          return (
            <div className="flex gap-3 items-center" key={collectible.tokenId}>
              <div
                className="rounded-xl"
                style={{
                  height: '36px',
                  width: '36px'
                }}
              >
                <CollectibleTileImage imageUrl={tokenMetadata?.image} />
              </div>
              <div className="flex flex-col gap-0.5">
                <Text variant="small" color="secondary" fontWeight="medium">
                  {dataCollectionInfo?.name || null}
                </Text>
                <Text variant="small" color="primary" fontWeight="bold">
                  {`${tokenMetadata?.name || 'Collectible'} ${collectibleQuantity > 1 ? `x${collectibleQuantity}` : ''}`}
                </Text>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1 flex-col">
        <div className="flex flex-row gap-2 items-center">
          <NetworkImage chainId={chainId} size="sm" />
          <Text color="white" variant="large" fontWeight="bold">{`${displayPrice} ${dataCurrencyInfo?.symbol}`}</Text>
        </div>
        <div>
          <Text color="muted" variant="normal" fontWeight="normal">
            {`$${priceFiat} estimated total`}
          </Text>
        </div>
      </div>
      <NetworkBadge chainId={chainId} />
    </div>
  )
}
