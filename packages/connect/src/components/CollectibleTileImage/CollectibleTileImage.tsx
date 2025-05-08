import { Card, Image } from '@0xsequence/design-system'
import type { FC } from 'react'

interface CollectibleTileImageProps {
  imageUrl?: string
}

export const CollectibleTileImage: FC<CollectibleTileImageProps> = ({ imageUrl }) => {
  return (
    <Card className="flex p-0 aspect-square justify-center items-center overflow-hidden rounded-lg bg-background-secondary">
      <Image className="h-full" src={imageUrl} />
    </Card>
  )
}
