import React from 'react'
import { Image } from '@0xsequence/design-system'

import { DefaultIcon } from '../shared/DefaultIcon'

interface CoinIconProps {
  imageUrl?: string
  size?: number
}

export const CoinIcon = ({ imageUrl, size = 30 }: CoinIconProps) => {
  if (imageUrl) {
    return <Image src={imageUrl} borderRadius="circle" style={{ width: `${size}px`, height: `${size}px` }} />
  }

  return <DefaultIcon size={size} />
}
