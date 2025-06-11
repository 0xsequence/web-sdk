import { Image, Skeleton, Text } from '@0xsequence/design-system'
import { useGetContractInfo } from '@0xsequence/hooks'

import type { TokenInfo } from '../index.js'

export const CollectionHeader = ({ contractAddress, chainId }: TokenInfo) => {
  const { data: collectionData } = useGetContractInfo({
    chainID: chainId.toString(),
    contractAddress
  })

  console.log(collectionData)

  return (
    <div className="flex flex-row items-center h-full w-full">
      <div className="px-3">
        {collectionData?.logoURI ? (
          <Image
            className="w-9 h-9 rounded-lg"
            src={collectionData?.logoURI}
            alt={collectionData?.name}
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
          {collectionData?.name}
        </Text>
      </div>
    </div>
  )
}
