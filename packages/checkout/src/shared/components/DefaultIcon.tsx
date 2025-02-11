import { Text } from '@0xsequence/design-system'
import React from 'react'

interface DefaultIconProps {
  size?: number
}

export const DefaultIcon = ({ size = 30 }: DefaultIconProps) => {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-background-inverse"
      style={{
        width: `${size}px`,
        height: `${size}px`
      }}
    >
      <Text className="inline-block" style={{ fontSize: `${size - 4}px` }} variant="large" color="inverse">
        ?
      </Text>
    </div>
  )
}
