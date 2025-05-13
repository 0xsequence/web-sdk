import { formatDisplay } from '@0xsequence/connect'
import { NetworkImage, Skeleton, Text, TokenImage } from '@0xsequence/design-system'
import React from 'react'
import { formatUnits } from 'viem'

import { useSettings } from '../hooks/index.js'

import { CollectibleTileImage } from './CollectibleTileImage.js'

interface SendItemInfoProps {
  name: string
  symbol: string
  decimals: number
  balance: string
  imageUrl?: string
  fiatValue?: string
  chainId: number
  showSquareImage?: boolean
  balanceSuffix?: string
}

export const SendItemInfoSkeleton = () => {
  return (
    <div className="flex items-center justify-between">
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

export const SendItemInfo = ({
  imageUrl,
  name,
  decimals,
  balance,
  symbol,
  fiatValue,
  chainId,
  showSquareImage,
  balanceSuffix = 'available'
}: SendItemInfoProps) => {
  const { fiatCurrency } = useSettings()
  const formattedBalance = formatUnits(BigInt(balance), decimals)
  const balanceDisplayed = formatDisplay(formattedBalance)

  return (
    <div className="flex items-end justify-between">
      <div className="flex justify-between items-center gap-2">
        {showSquareImage ? (
          <div style={{ width: '40px' }}>
            <CollectibleTileImage imageUrl={imageUrl} />
          </div>
        ) : (
          <TokenImage src={imageUrl} size="lg" />
        )}
        <div className="flex flex-col items-start">
          <div className="flex flex-row items-center gap-1">
            <Text variant="medium" color="primary">
              {name}
            </Text>
            <NetworkImage chainId={chainId} size="xs" />
          </div>
          <Text color="muted" variant="normal">
            {' '}
            {`${balanceDisplayed} ${symbol} ${balanceSuffix}`}
          </Text>
        </div>
      </div>
      <div className="flex flex-col items-end justify-end">
        {fiatValue && <Text variant="normal" color="primary">{`${fiatCurrency.sign}${fiatValue}`}</Text>}
      </div>
    </div>
  )
}
