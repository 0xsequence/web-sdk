import { TokenBalance } from '@0xsequence/indexer'
import { useTokenMetadata } from '@0xsequence/kit'
import React from 'react'

import { CollectibleTileImage } from '../../../../../shared/CollectibleTileImage'

interface CollectibleTileProps {
  balance: TokenBalance
}

export const CollectibleTile = ({ balance }: CollectibleTileProps) => {
  const { data: tokenMetadata } = useTokenMetadata(balance.chainId, balance.contractAddress, [balance.tokenID || ''])

  const imageUrl = tokenMetadata?.[0]?.image

  return <CollectibleTileImage imageUrl={imageUrl} />
}
