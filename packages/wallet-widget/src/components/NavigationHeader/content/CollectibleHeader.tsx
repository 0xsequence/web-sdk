import { Image, Skeleton, Text } from '@0xsequence/design-system'
import { useGetTokenMetadata } from '@0xsequence/hooks'

import type { TokenInfo } from '../index.js'

export const CollectibleHeader = ({ chainId, contractAddress, tokenId }: TokenInfo) => {
  const collectibleMetadata = useGetTokenMetadata({
    chainID: chainId.toString(),
    contractAddress: contractAddress,
    tokenIDs: [tokenId ?? '']
  }).data?.[0]

  return (
    <div className="flex flex-row items-center h-full w-full">
      <div className="px-3">
        {collectibleMetadata?.image ? (
          <Image
            className="w-9 h-9 rounded-lg"
            src={collectibleMetadata?.image}
            alt={collectibleMetadata?.name}
            style={{
              objectFit: 'cover'
            }}
          />
        ) : (
          <Skeleton className="w-9 h-9 rounded-lg" />
        )}
      </div>

      <div className="flex flex-col">
        <Text
          variant="medium"
          color="primary"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {collectibleMetadata?.name}
        </Text>
      </div>
    </div>
  )
}
