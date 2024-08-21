import { Box, Card, Image, Text, Skeleton, TokenImage, NetworkImage } from '@0xsequence/design-system'
import { useContractInfo, useTokenMetadata } from '@0xsequence/kit'
import { ethers } from 'ethers'
import React from 'react'

import { formatDisplay } from '../../../utils'

interface OrderSummaryItem {
  contractAddress: string
  tokenId: string
  quantityRaw: string
  chainId: number
}

export const OrderSummaryItem = ({ contractAddress, tokenId, quantityRaw, chainId }: OrderSummaryItem) => {
  const { data: tokenMetadata, isPending: isPendingTokenMetadata } = useTokenMetadata(chainId, contractAddress, [tokenId])
  const { data: contractInfo, isPending: isPendingContractInfo } = useContractInfo(chainId, contractAddress)
  const isPending = isPendingTokenMetadata || isPendingContractInfo

  if (isPending) {
    return <OrderSummarySkeleton />
  }

  const { name = 'unknown', image, decimals = 0 } = tokenMetadata?.[0] ?? {}

  const { logoURI: collectionLogoURI, name: collectionName = 'Unknown Collection' } = contractInfo || {}

  const balanceFormatted = ethers.formatUnits(quantityRaw, decimals)

  return (
    <Card flexDirection="row" alignItems="flex-start" justifyContent="space-between">
      <Box flexDirection="row" alignItems="center" justifyContent="center" gap="2">
        <Box aspectRatio="1/1" height="full" justifyContent="center" alignItems="center" style={{ width: '80px' }}>
          <Image src={image} borderRadius="md" style={{ maxWidth: '80px', height: '80px', objectFit: 'cover' }} />
        </Box>
        <Box flexDirection="column" alignItems="flex-start" justifyContent="center" gap="2">
          <Box gap="1" alignItems="center">
            <TokenImage src={collectionLogoURI} size="xs" />
            <Text marginLeft="1" variant="small" color="text80" fontWeight="bold">
              {collectionName}
            </Text>
            <NetworkImage chainId={chainId} size="xs" />
          </Box>
          <Box
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            style={{
              width: '180px'
            }}
          >
            <Text variant="normal" color="text100">
              {name}
            </Text>
            <Text variant="normal" color="text50">{`#${tokenId}`}</Text>
          </Box>
        </Box>
      </Box>
      <Box height="full">
        <Text variant="small" color="text50" fontWeight="bold">{`x${formatDisplay(balanceFormatted)}`}</Text>
      </Box>
    </Card>
  )
}

export const OrderSummarySkeleton = () => {
  return (
    <Card flexDirection="row" alignItems="flex-start" justifyContent="space-between">
      <Box flexDirection="row" alignItems="center" justifyContent="center" gap="2">
        <Skeleton style={{ width: '80px', height: '80px' }} />
        <Box flexDirection="column" alignItems="flex-start" justifyContent="center" gap="2">
          <Skeleton style={{ width: '100px', height: '14px' }} />
          <Skeleton style={{ width: '180px', height: '34px' }} />
        </Box>
      </Box>
      <Skeleton style={{ width: '14px', height: '14px' }} />
    </Card>
  )
}
