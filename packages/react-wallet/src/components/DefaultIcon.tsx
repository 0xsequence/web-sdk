import { Text } from '@0xsequence/design-system'
import React from 'react'

interface DefaultIconProps {
  size?: number
}

export const DefaultIcon = ({ size = 30 }: DefaultIconProps) => {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-background-inverse shrink-0"
      style={{
        width: `${size}px`,
        height: `${size}px`
      }}
    >
      <Text variant="large" color="inverse">
        ?
      </Text>
    </div>
  )
}
