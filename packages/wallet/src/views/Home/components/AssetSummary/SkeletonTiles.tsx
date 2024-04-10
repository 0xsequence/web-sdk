import React from 'react'
import { Box, vars } from '@0xsequence/design-system'
import { Skeleton } from '../../../../shared/Skeleton'

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
            <Skeleton height="100%" width="100%" aspectRatio="1/1" />
          </Box>
        ))}
    </Box>
  )
}
