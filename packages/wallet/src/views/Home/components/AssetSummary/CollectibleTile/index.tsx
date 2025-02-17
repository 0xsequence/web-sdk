import { TokenBalance } from '@0xsequence/indexer'
import { useGetTokenMetadata } from '@0xsequence/kit-hooks'

import { CollectibleTileImage } from '../../../../../shared/CollectibleTileImage'

interface CollectibleTileProps {
  balance: TokenBalance
}

export const CollectibleTile = ({ balance }: CollectibleTileProps) => {
  const { data: tokenMetadata } = useGetTokenMetadata({
    chainID: String(balance.chainId),
    contractAddress: balance.contractAddress,
    tokenIDs: [balance.tokenID || '']
  })

  const imageUrl = tokenMetadata?.[0]?.image

  return <CollectibleTileImage imageUrl={imageUrl} />
}
