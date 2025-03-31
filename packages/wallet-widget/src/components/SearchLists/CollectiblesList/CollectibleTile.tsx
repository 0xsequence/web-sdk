import { useGetTokenMetadata } from '@0xsequence/hooks'

import { TokenBalanceWithPrice } from '../../../utils'
import { CollectibleTileImage } from '../../CollectibleTileImage'

interface CollectibleTileProps {
  balance: TokenBalanceWithPrice
  onTokenClick: (token: TokenBalanceWithPrice) => void
}

export const CollectibleTile = ({ balance, onTokenClick }: CollectibleTileProps) => {
  const onClick = () => {
    onTokenClick(balance)
  }

  const { data: tokenMetadata } = useGetTokenMetadata({
    chainID: String(balance.chainId),
    contractAddress: balance.contractAddress,
    tokenIDs: [balance.tokenID || '']
  })

  const imageUrl = tokenMetadata?.[0]?.image

  return (
    <div className="select-none cursor-pointer aspect-square" onClick={onClick}>
      <CollectibleTileImage imageUrl={imageUrl} />
    </div>
  )
}
