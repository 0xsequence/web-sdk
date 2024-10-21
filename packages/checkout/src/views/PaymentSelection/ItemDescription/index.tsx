import { Box, Spinner, Text } from '@0xsequence/design-system'
import { NetworkBadge, CollectibleTileImage, useTokenMetadata } from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'

import { useSelectPaymentModal } from '../../../hooks'

export interface ItemDescriptionProps {
  tokenId: string
  nftQuantity: string
}

export const ItemDescription = ({ tokenId, nftQuantity }: ItemDescriptionProps) => {
  const { selectPaymentSettings } = useSelectPaymentModal()
  const chain = selectPaymentSettings!.chain
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const collectionAddress = selectPaymentSettings!.collectionAddress
  const { data: tokenMetadatas, isLoading: isLoadingTokenMetadatas } = useTokenMetadata(chainId, collectionAddress, [tokenId])
  const tokenMetadata = tokenMetadatas?.[0]

  const isLoading = isLoadingTokenMetadatas

  if (isLoading) {
    return (
      <Box marginBottom="2" paddingX="6" gap="3" style={{ height: '72px' }}>
        <Spinner />
      </Box>
    )
  }

  return (
    <Box marginBottom="2" paddingX="6" gap="5" alignItems="center">
      <Box position="relative">
        <Box
          background="backgroundControl"
          borderRadius="md"
          style={{
            height: '60px',
            width: '60px',
            transform: 'rotate(-15deg)'
          }}
        />
        <Box
          position="absolute"
          borderRadius="md"
          style={{
            height: '60px',
            width: '60px',
            bottom: '0'
          }}
        >
          <CollectibleTileImage imageUrl={tokenMetadata?.image} />
        </Box>
      </Box>
      <Box flexDirection="column" gap="0.5">
        <Text variant="normal" color="text100" fontWeight="bold">
          {tokenMetadata?.name || 'Unknown'}
        </Text>
        <Text variant="normal" color="text50" fontWeight="medium">
          {Number(nftQuantity) === 1 ? `${nftQuantity} item` : `${nftQuantity} items`}
        </Text>
        <Box marginTop="1">
          <NetworkBadge chainId={chainId} />
        </Box>
      </Box>
    </Box>
  )
}
