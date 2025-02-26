import { Box, Skeleton, vars } from '@0xsequence/design-system'
import React from 'react'

export const SkeletonTiles = () => {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: `calc(50% - ${vars.space[1]}) calc(50% - ${vars.space[1]})`,
        gap: vars.space[2]
      }}
    >
      {Array(12)
        .fill(null)
        .map((_, i) => (
          <Box key={i}>
            <Skeleton height="full" width="full" aspectRatio="1/1" />
          </Box>
        ))}
    </Box>
  )
}
