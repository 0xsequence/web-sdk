import { Skeleton } from '@0xsequence/design-system'
import React from 'react'

export const SkeletonTiles = () => {
  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `calc(50% - 4px) calc(50% - 4px)`
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
