import { Box, NetworkImage, Text, TokenImage } from '@0xsequence/design-system'
import React from 'react'

import { useSettings } from '../../../../../hooks'
import { getPercentageColor } from '../../../../../utils'

interface CoinTileContentProps {
  logoUrl?: string
  tokenName: string
  balance: string
  balanceFiat: string
  priceChangePercentage: number
  symbol: string
  chainId: number
}

export const CoinTileContent = ({
  logoUrl,
  tokenName,
  balance,
  balanceFiat,
  priceChangePercentage,
  symbol,
  chainId
}: CoinTileContentProps) => {
  const { fiatCurrency } = useSettings()
  const priceChangeSymbol = priceChangePercentage > 0 ? '+' : ''

  return (
    <Box
      background="backgroundSecondary"
      width="full"
      height="full"
      borderRadius="md"
      padding="4"
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
      gap="1"
    >
      <Box marginBottom="1">
        <TokenImage src={logoUrl} symbol={symbol} size="xl" />
      </Box>
      <Box marginBottom="3">
        <Box flexDirection="row" gap="1" justifyContent="flex-start" alignItems="center">
          <Text
            fontWeight="bold"
            whiteSpace="nowrap"
            color="text100"
            style={{ maxWidth: '130px', textOverflow: 'ellipsis', overflow: 'hidden' }}
          >
            {tokenName}
          </Text>
          <NetworkImage chainId={chainId} size="xs" />
        </Box>
        <Text
          color="text50"
          whiteSpace="nowrap"
          style={{ display: 'block', maxWidth: '150px', textOverflow: 'ellipsis', overflow: 'hidden' }}
        >
          {`${balance} ${symbol}`}
        </Text>
      </Box>
      <Box>
        <Box>
          <Text fontWeight="bold" color="text100">{`${fiatCurrency.sign}${balanceFiat}`}</Text>
        </Box>
        <Text style={{ color: getPercentageColor(priceChangePercentage) }}>
          {`${priceChangeSymbol}${priceChangePercentage.toFixed(2)}%`}
        </Text>
      </Box>
    </Box>
  )
}
