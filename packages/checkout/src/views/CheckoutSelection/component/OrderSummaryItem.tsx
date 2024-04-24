import React from 'react'
import { ethers } from 'ethers'
import { useConfig } from 'wagmi'
import { Box, Card, Image, Text } from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId } from '@0xsequence/kit'
import { CoinIcon } from '../../../shared/components/CoinIcon'
import { Skeleton } from '../../../shared/components/Skeleton'

import { useTokenMetadata, useContractInfo } from '../../../hooks'
import { formatDisplay } from '../../../utils'

interface OrderSummaryItem {
  contractAddress: string
  tokenId: string
  quantityRaw: string
  chainId: number
}

export const OrderSummaryItem = ({ contractAddress, tokenId, quantityRaw, chainId }: OrderSummaryItem) => {
  const { chains } = useConfig()
  const { data: tokenMetadata, isPending: isPendingTokenMetadata } = useTokenMetadata({
    chainId,
    contractAddress,
    tokenId
  })

  const { data: contractInfo, isPending: isPendingContractInfo } = useContractInfo({
    chainID: String(chainId),
    contractAddress
  })

  const isPending = isPendingTokenMetadata || isPendingContractInfo

  if (isPending) {
    return <OrderSummarySkeleton />
  }

  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, [...chains])
  const { name = 'unknown', image, decimals = 0 } = tokenMetadata || {}

  const { logoURI: collectionLogoURI, name: collectionName = 'Unknown Collection' } = contractInfo || {}

  const balanceFormatted = ethers.utils.formatUnits(quantityRaw, decimals)

  return (
    <Card flexDirection="row" alignItems="flex-start" justifyContent="space-between">
      <Box flexDirection="row" alignItems="center" justifyContent="center" gap="2">
        <Box aspectRatio="1/1" height="full" justifyContent="center" alignItems="center" style={{ width: '80px' }}>
          <Image src={image} borderRadius="md" style={{ height: '80px' }} />
        </Box>
        <Box flexDirection="column" alignItems="flex-start" justifyContent="center" gap="2">
          <Box gap="1" alignItems="center">
            <CoinIcon size={12} imageUrl={collectionLogoURI} />
            <Text marginLeft="1" fontSize="small" color="text80" fontWeight="bold">
              {collectionName}
            </Text>
            <CoinIcon size={12} imageUrl={nativeTokenInfo.logoURI} />
          </Box>
          <Box
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            style={{
              width: '180px'
            }}
          >
            <Text color="text100" fontSize="normal" fontWeight="normal">
              {name}
            </Text>
            <Text color="text50" fontSize="normal" fontWeight="normal">{`#${tokenId}`}</Text>
          </Box>
        </Box>
      </Box>
      <Box height="full" fontSize="small" color="text50" fontWeight="bold">
        {`x${formatDisplay(balanceFormatted)}`}
      </Box>
    </Card>
  )
}

export const OrderSummarySkeleton = () => {
  return (
    <Card flexDirection="row" alignItems="flex-start" justifyContent="space-between">
      <Box flexDirection="row" alignItems="center" justifyContent="center" gap="2">
        <Skeleton height="80px" width="80px" />
        <Box flexDirection="column" alignItems="flex-start" justifyContent="center" gap="2">
          <Skeleton width="100px" height="14px" />
          <Skeleton width="180px" height="34px" />
        </Box>
      </Box>
      <Skeleton height="14px" width="14px" />
    </Card>
  )
}
