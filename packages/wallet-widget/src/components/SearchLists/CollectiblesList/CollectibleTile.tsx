import { NetworkImage } from '@0xsequence/design-system'
import { useGetTokenMetadata } from '@0xsequence/hooks'

import type { TokenBalanceWithPrice } from '../../../utils'
import { CollectibleTileImage } from '../../CollectibleTileImage'

const NETWORK_IMAGE_SIZE = '15%'
const NETWORK_IMAGE_OFFSET = '2%'

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
    <div className="select-none cursor-pointer aspect-square relative" onClick={onClick}>
      <CollectibleTileImage imageUrl={imageUrl} />
      <NetworkImage
        chainId={balance.chainId}
        className={`absolute z-1`}
        style={{
          width: NETWORK_IMAGE_SIZE,
          height: NETWORK_IMAGE_SIZE,
          right: NETWORK_IMAGE_OFFSET,
          bottom: NETWORK_IMAGE_OFFSET
        }}
      />
    </div>
  )
}
