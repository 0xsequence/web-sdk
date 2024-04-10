import React from 'react'
import { TokenBalance } from '@0xsequence/indexer'

import { useTokenMetadata } from '../../../../../hooks'
import { CollectibleTileImage } from '../../../../../shared/CollectibleTileImage'

interface CollectibleTileProps {
  balance: TokenBalance
}

export const CollectibleTile = ({ balance }: CollectibleTileProps) => {
  const { data: tokenMetadata } = useTokenMetadata({
    tokens: {
      chainId: balance.chainId,
      contractAddress: balance.contractAddress,
      tokenIds: [balance.tokenID]
    }
  })

  const imageUrl = tokenMetadata?.[0]?.image

  return <CollectibleTileImage imageUrl={imageUrl} />
}
