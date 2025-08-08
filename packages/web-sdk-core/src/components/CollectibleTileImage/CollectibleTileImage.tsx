import { Card, Image, NetworkImage } from '@0xsequence/design-system'
import type { FC } from 'react'

interface CollectibleTileImageProps {
  imageUrl?: string
  networkImage?: number
}

const NETWORK_IMAGE_SIZE = '15px'

export const CollectibleTileImage: FC<CollectibleTileImageProps> = ({ imageUrl, networkImage }) => {
  return (
    <Card
      className={'flex p-0 aspect-square justify-center items-center overflow-hidden rounded-lg bg-background-secondary relative'}
    >
      <div className="relative w-full h-full">
        <Image className="h-full" src={imageUrl} />
        {networkImage && (
          <div className="absolute bottom-0 right-0 -mb-[1px] -mr-[1px] w-[17px] h-[17px] rounded-full border-2 border-background-primary">
            <div className="absolute inset-0 flex items-center justify-center">
              <NetworkImage
                className={'object-cover'}
                chainId={networkImage}
                style={{
                  width: NETWORK_IMAGE_SIZE,
                  height: NETWORK_IMAGE_SIZE
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
