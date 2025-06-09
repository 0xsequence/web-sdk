import { Image, Text } from '@0xsequence/design-system'

import type { TokenInfo } from '../index.js'

export const CollectionHeader = ({ contractAddress, chainId, tokenId, accountAddress }: TokenInfo) => {
  return (
    <div className="flex flex-row items-center h-full w-full">
      <div className="px-3">
        <Image
          className="w-9 h-9"
          src={''}
          alt={''}
          style={{
            objectFit: 'cover'
          }}
        />
      </div>
      <div className="flex flex-col">
        <Text variant="medium" color="text100">
          {''}
        </Text>
      </div>
    </div>
  )
}
