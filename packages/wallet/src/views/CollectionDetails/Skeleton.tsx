import { Skeleton } from '@0xsequence/design-system'
import React from 'react'

import { NetworkBadge } from '../../shared/NetworkBadge'

interface CollectionDetailsSkeletonProps {
  chainId: number
}

export const CollectionDetailsSkeleton = ({ chainId }: CollectionDetailsSkeletonProps) => {
  return (
    <div className="flex px-4 pb-5 pt-3 mt-8 flex-col items-center justify-center gap-10">
      <div className="flex flex-col gap-2 justify-center items-center">
        <Skeleton style={{ width: '32px', height: '32px' }} />
        <Skeleton style={{ width: '100px', height: '24px' }} />
        <NetworkBadge chainId={chainId} />
        <Skeleton style={{ width: '142px', height: '17px' }} />
      </div>
      <div className="w-full">
        <Skeleton style={{ width: '168px', height: '20px' }} />
        <div
          className="w-full mt-3 grid gap-2"
          style={{
            gridTemplateColumns: `calc(50% - 4px) calc(50% - 4px)`
          }}
        >
          {Array(8)
            .fill(null)
            .map((_, i) => (
              <Skeleton className="w-full aspect-square" key={i} />
            ))}
        </div>
      </div>
    </div>
  )
}
