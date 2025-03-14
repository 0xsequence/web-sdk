import { TokenBalance } from '@0xsequence/indexer'
import { useGetTokenMetadata } from '@0xsequence/react-hooks'

import { CollectibleTileImage } from '../../../components/CollectibleTileImage'
import { useNavigation } from '../../../hooks'

interface CollectibleTileProps {
  balance: TokenBalance
}

export const CollectibleTile = ({ balance }: CollectibleTileProps) => {
  const { setNavigation } = useNavigation()

  const onClickItem = (balance: TokenBalance) => {
    setNavigation({
      location: 'collectible-details',
      params: { contractAddress: balance.contractAddress, chainId: balance.chainId, tokenId: balance.tokenID || '' }
    })
  }

  const { data: tokenMetadata } = useGetTokenMetadata({
    chainID: String(balance.chainId),
    contractAddress: balance.contractAddress,
    tokenIDs: [balance.tokenID || '']
  })

  const imageUrl = tokenMetadata?.[0]?.image

  return (
    <div className="select-none cursor-pointer aspect-square" onClick={() => onClickItem(balance)}>
      <CollectibleTileImage imageUrl={imageUrl} />
    </div>
  )
}
