import { Box, Text } from '@0xsequence/design-system'
import React from 'react'

interface DefaultIconProps {
  size?: number
}

export const DefaultIcon = ({ size = 30 }: DefaultIconProps) => {
  return (
    <Box
      alignItems="center"
      justifyContent="center"
      borderRadius="circle"
      background="backgroundInverse"
      flexShrink="0"
      style={{
        width: `${size}px`,
        height: `${size}px`
      }}
    >
      <Text variant="large" color="textInverse100">
        ?
      </Text>
    </Box>
  )
}
