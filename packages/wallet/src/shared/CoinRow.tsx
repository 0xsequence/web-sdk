import { Box, Image, Text, vars } from '@0xsequence/design-system'

import React from 'react'
import { Skeleton } from '../shared/Skeleton'
import { ethers } from 'ethers'

import { CoinIcon } from './CoinIcon'
import { formatDisplay, getPercentageColor } from '../utils'

interface CoinRowProps {
  name: string
  symbol: string
  decimals: number
  balance: string
  imageUrl?: string
  fiatValue: string
  priceChangePercentage: number
}

export const CoinRowSkeleton = () => {
  return (
    <Box
      height="14"
      alignItems="center"
      justifyContent="space-between"
      background="backgroundSecondary"
      borderRadius="md"
      paddingY="2"
      paddingX="3"
    >
      <Box justifyContent="center" alignItems="center" gap="2">
        <Skeleton width={30} height={30} borderRadius="circle" />
        <Box flexDirection="column" gap="2" alignItems="flex-start">
          <Skeleton width={100} height={14} />
          <Skeleton width={75} height={14} />
        </Box>
      </Box>
      <Box flexDirection="column" gap="2" alignItems="flex-end">
        <Skeleton width={100} height={14} />
        <Skeleton width={50} height={12} />
      </Box>
    </Box>
  )
}

export const CoinRow = ({ imageUrl, name, decimals, balance, symbol, fiatValue, priceChangePercentage }: CoinRowProps) => {
  const formattedBalance = ethers.utils.formatUnits(balance, decimals)
  const balanceDisplayed = formatDisplay(formattedBalance)

  return (
    <Box
      height="14"
      alignItems="center"
      justifyContent="space-between"
      background="backgroundSecondary"
      borderRadius="md"
      paddingY="2"
      paddingX="3"
    >
      <Box justifyContent="center" alignItems="center" gap="2">
        <CoinIcon imageUrl={imageUrl} size={30} />
        <Box flexDirection="column" alignItems="flex-start">
          <Text variant="medium" color="text100">
            {name}
          </Text>
          <Text color="text50" variant="normal">
            {' '}
            {`${balanceDisplayed} ${symbol}`}
          </Text>
        </Box>
      </Box>
      <Box flexDirection="column" alignItems="flex-end">
        <Text variant="normal" color="text100">{`$${fiatValue}`}</Text>
        <Text variant="small" style={{ color: getPercentageColor(priceChangePercentage) }}>
          {priceChangePercentage.toFixed(2)}%
        </Text>
      </Box>
    </Box>
  )
}
