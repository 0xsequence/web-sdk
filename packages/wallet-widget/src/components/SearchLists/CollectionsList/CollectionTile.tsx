import { NetworkImage } from '@0xsequence/design-system'
import type { ContractInfo } from '@0xsequence/indexer'

import { TokenTileImage } from '../../TokenTileImage.js'

const NETWORK_IMAGE_SIZE = '15%'
const NETWORK_IMAGE_OFFSET = '2%'

interface CollectionTileProps {
  balance: ContractInfo
  onTokenClick: (token: ContractInfo) => void
}

export const CollectionTile = ({ balance, onTokenClick }: CollectionTileProps) => {
  const onClick = () => {
    onTokenClick(balance)
  }

  const imageUrl = balance.logoURI
  const symbol = balance.name

  return (
    <div className="select-none cursor-pointer aspect-square relative" onClick={onClick}>
      <TokenTileImage src={imageUrl} symbol={symbol} />
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
