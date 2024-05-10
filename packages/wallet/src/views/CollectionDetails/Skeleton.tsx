import { Box, Skeleton, vars } from '@0xsequence/design-system'
import React from 'react'

import { NetworkBadge } from '../../shared/NetworkBadge'

interface CollectionDetailsSkeletonProps {
  chainId: number
}

export const CollectionDetailsSkeleton = ({ chainId }: CollectionDetailsSkeletonProps) => {
  return (
    <Box
      paddingX="4"
      paddingBottom="5"
      paddingTop="3"
      marginTop="8"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="10"
    >
      <Box flexDirection="column" gap="2" justifyContent="center" alignItems="center">
        <Skeleton style={{ width: '32px', height: '32px' }} />
        <Skeleton style={{ width: '100px', height: '24px' }} />
        <NetworkBadge chainId={chainId} />
        <Skeleton style={{ width: '142px', height: '17px' }} />
      </Box>
      <Box width="full">
        <Skeleton style={{ width: '168px', height: '20px' }} />
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `calc(50% - ${vars.space[1]}) calc(50% - ${vars.space[1]})`,
            gap: vars.space[2]
          }}
          width="full"
          marginTop="3"
        >
          {Array(8)
            .fill(null)
            .map((_, i) => (
              <Skeleton key={i} width="full" aspectRatio="1/1" />
            ))}
        </Box>
      </Box>
    </Box>
  )
}
