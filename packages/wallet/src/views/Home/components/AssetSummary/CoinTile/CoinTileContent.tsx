import { NetworkImage, Text, TokenImage } from '@0xsequence/design-system'
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
    <div className="flex bg-background-secondary w-full h-full rounded-xl p-4 flex-col justify-center items-start gap-1">
      <div className="mb-1">
        <TokenImage src={logoUrl} symbol={symbol} size="lg" />
      </div>
      <div className="mb-3">
        <div className="flex flex-row gap-1 justify-start items-center">
          <Text
            className="whitespace-nowrap"
            fontWeight="bold"
            color="primary"
            style={{ maxWidth: '130px', textOverflow: 'ellipsis', overflow: 'hidden' }}
          >
            {tokenName}
          </Text>
          <NetworkImage chainId={chainId} size="xs" />
        </div>
        <Text color="muted" ellipsis nowrap block style={{ maxWidth: '150px' }}>
          {`${balance} ${symbol}`}
        </Text>
      </div>
      <div>
        <div>
          <Text variant="normal" fontWeight="bold" color="primary">{`${fiatCurrency.sign}${balanceFiat}`}</Text>
        </div>
        <Text variant="normal" color={getPercentageColor(priceChangePercentage)}>
          {`${priceChangeSymbol}${priceChangePercentage.toFixed(2)}%`}
        </Text>
      </div>
    </div>
  )
}
