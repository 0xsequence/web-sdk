import { Box, NetworkImage, Skeleton, Text, TokenImage } from '@0xsequence/design-system'
import { ethers } from 'ethers'
import React from 'react'

import { useSettings } from '../hooks'
import { CollectibleTileImage } from '../shared/CollectibleTileImage'
import { formatDisplay } from '../utils'

interface SendItemInfoProps {
  name: string
  symbol: string
  decimals: number
  balance: string
  imageUrl?: string
  fiatValue?: string
  chainId: number
  showSquareImage?: boolean
}

export const SendItemInfoSkeleton = () => {
  return (
    <Box alignItems="center" justifyContent="space-between">
      <Box justifyContent="center" alignItems="center" gap="2">
        <Skeleton style={{ width: 30, height: 30 }} borderRadius="circle" />
        <Box flexDirection="column" gap="2" alignItems="flex-start">
          <Skeleton style={{ width: 100, height: 14 }} />
          <Skeleton style={{ width: 75, height: 14 }} />
        </Box>
      </Box>
      <Box flexDirection="column" gap="2" alignItems="flex-end">
        <Skeleton style={{ width: 100, height: 14 }} />
        <Skeleton style={{ width: 50, height: 12 }} />
      </Box>
    </Box>
  )
}

export const SendItemInfo = ({
  imageUrl,
  name,
  decimals,
  balance,
  symbol,
  fiatValue,
  chainId,
  showSquareImage
}: SendItemInfoProps) => {
  const { fiatCurrency } = useSettings()
  const formattedBalance = ethers.formatUnits(balance, decimals)
  const balanceDisplayed = formatDisplay(formattedBalance)

  return (
    <Box alignItems="flex-end" justifyContent="space-between">
      <Box justifyContent="space-between" alignItems="center" gap="2">
        {showSquareImage ? (
          <Box style={{ width: '40px' }}>
            <CollectibleTileImage imageUrl={imageUrl} />
          </Box>
        ) : (
          <TokenImage src={imageUrl} size="lg" />
        )}
        <Box flexDirection="column" alignItems="flex-start">
          <Box flexDirection="row" alignItems="center" gap="1">
            <Text variant="medium" color="text100">
              {name}
            </Text>
            <NetworkImage chainId={chainId} size="xs" />
          </Box>
          <Text color="text50" variant="normal">
            {' '}
            {`${balanceDisplayed} ${symbol} available`}
          </Text>
        </Box>
      </Box>
      <Box flexDirection="column" alignItems="flex-end" justifyContent="flex-end">
        {fiatValue && <Text variant="normal" color="text100">{`${fiatCurrency.sign}${fiatValue}`}</Text>}
      </Box>
    </Box>
  )
}
