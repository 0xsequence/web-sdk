import { formatUnits } from 'viem'

import { useSelectPaymentModal } from '../../../hooks'

import { Box, NetworkImage, Spinner, Text } from '@0xsequence/design-system'
import { CollectibleTileImage, NetworkBadge, formatDisplay } from '@0xsequence/kit'
import { useGetCoinPrices, useGetContractInfo, useGetTokenMetadata } from '@0xsequence/kit-hooks'
import { findSupportedNetwork } from '@0xsequence/network'

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
      <Box marginBottom="2" gap="3" style={{ height: '72px' }}>
        <Spinner />
      </Box>
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
    <Box flexDirection="column" gap="5">
      <Box>
        <Text
          variant="small"
          fontWeight="bold"
          color="text100"
        >{`${totalQuantity} ${totalQuantity > 1 ? 'items' : 'item'}`}</Text>
      </Box>

      <Box flexDirection="row" gap="1">
        {selectPaymentSettings!.collectibles.map(collectible => {
          const collectibleQuantity = Number(formatUnits(BigInt(collectible.quantity), Number(collectible.decimals || 0)))
          const tokenMetadata = tokenMetadatas?.tokenMetadata.find(tokenMetadata => tokenMetadata.tokenId === collectible.tokenId)

          return (
            <Box gap="3" alignItems="center" key={collectible.tokenId}>
              <Box
                borderRadius="md"
                style={{
                  height: '36px',
                  width: '36px'
                }}
              >
                <CollectibleTileImage imageUrl={tokenMetadata?.image} />
              </Box>
              <Box flexDirection="column" gap="0.5">
                <Text variant="small" color="text80" fontWeight="medium">
                  {dataCollectionInfo?.name || null}
                </Text>
                <Text variant="small" color="text100" fontWeight="bold">
                  {`${tokenMetadata?.name || 'Collectible'} ${collectibleQuantity > 1 ? `x${collectibleQuantity}` : ''}`}
                </Text>
              </Box>
            </Box>
          )
        })}
      </Box>
      <Box gap="1" flexDirection="column">
        <Box flexDirection="row" gap="2" alignItems="center">
          <NetworkImage chainId={chainId} size="sm" />
          <Text color="white" variant="large" fontWeight="bold">{`${displayPrice} ${dataCurrencyInfo?.symbol}`}</Text>
        </Box>
        <Box>
          <Text color="text50" variant="normal" fontWeight="normal">
            {`$${priceFiat} estimated total`}
          </Text>
        </Box>
      </Box>
      <NetworkBadge chainId={chainId} />
    </Box>
  )
}
