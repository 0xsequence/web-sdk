import { Skeleton } from '@0xsequence/design-system'
import React from 'react'

export const SkeletonTiles = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `calc(50% - ${vars.space[1]}) calc(50% - ${vars.space[1]})`,
        gap: vars.space[2]
      }}
    >
      {Array(12)
        .fill(null)
        .map((_, i) => (
          <div key={i}>
            <Skeleton className="h-full w-full aspect-square" />
          </div>
        ))}
    </div>
  )
}
