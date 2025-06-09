import { Image, Text } from '@0xsequence/design-system'
import { useGetTokenMetadata } from '@0xsequence/hooks'

import type { TokenInfo } from '../index.js'

export const CollectibleHeader = ({ accountAddress, chainId, contractAddress, tokenId }: TokenInfo) => {
  const collectibleMetadata = useGetTokenMetadata({
    chainID: chainId.toString(),
    contractAddress: contractAddress,
    tokenIDs: [tokenId ?? '']
  }).data?.[0]

  return (
    <div className="flex flex-row items-center h-full w-full">
      <div className="px-3">
        <Image className="w-9 h-9 rounded-lg" src={collectibleMetadata?.image} alt={collectibleMetadata?.name} />
      </div>
      <div className="flex flex-col">
        <Text variant="medium" color="primary">
          {collectibleMetadata?.name}
        </Text>
      </div>
    </div>
  )
}
