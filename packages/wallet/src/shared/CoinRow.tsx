import { Skeleton, Text, TokenImage } from '@0xsequence/design-system'
import { formatDisplay } from '@0xsequence/kit'
import { ethers } from 'ethers'
import React from 'react'

import { getPercentageColor } from '../utils'

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
    <div className="flex h-14 items-center justify-between bg-background-secondary rounded-xl py-2 px-3">
      <div className="flex justify-center items-center gap-2">
        <Skeleton className="rounded-full" style={{ width: 30, height: 30 }} />
        <div className="flex flex-col gap-2 items-start">
          <Skeleton style={{ width: 100, height: 14 }} />
          <Skeleton style={{ width: 75, height: 14 }} />
        </div>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <Skeleton style={{ width: 100, height: 14 }} />
        <Skeleton style={{ width: 50, height: 12 }} />
      </div>
    </div>
  )
}

export const CoinRow = ({ imageUrl, name, decimals, balance, symbol, fiatValue, priceChangePercentage }: CoinRowProps) => {
  const formattedBalance = ethers.formatUnits(balance, decimals)
  const balanceDisplayed = formatDisplay(formattedBalance)

  return (
    <div className="flex h-14 items-center justify-between bg-background-secondary rounded-xl py-2 px-3">
      <div className="flex justify-center items-center gap-2">
        <TokenImage src={imageUrl} symbol={symbol} size="lg" />
        <div className="flex flex-col items-start">
          <Text variant="medium" color="text100">
            {name}
          </Text>
          <Text color="text50" variant="normal">
            {' '}
            {`${balanceDisplayed} ${symbol}`}
          </Text>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <Text variant="normal" color="text100">{`$${fiatValue}`}</Text>
        <Text variant="small" color={getPercentageColor(priceChangePercentage)}>
          {priceChangePercentage.toFixed(2)}%
        </Text>
      </div>
    </div>
  )
}
