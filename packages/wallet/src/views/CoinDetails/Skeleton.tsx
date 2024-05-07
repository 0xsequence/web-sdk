import React from 'react'
import { Box, Button, SendIcon, Skeleton, Text } from '@0xsequence/design-system'

import { TransactionHistorySkeleton } from '../../shared/TransactionHistoryList/TransactionHistorySkeleton'
import { NetworkBadge } from '../../shared/NetworkBadge'

import { HEADER_HEIGHT } from '../../constants'
import { useScrollbarWidth } from '../../hooks/useScrollbarWidth'

interface CoinDetailsSkeletonProps {
  chainId: number
}

export const CoinDetailsSkeleton = ({ chainId }: CoinDetailsSkeletonProps) => {
  const scrollbarWidth = useScrollbarWidth()

  return (
    <Box style={{ paddingTop: HEADER_HEIGHT }}>
      <Box flexDirection="column" gap="10" paddingBottom="5" paddingX="4" paddingTop="0" style={{ marginTop: '-20px' }}>
        <Box marginBottom="10" gap="2" alignItems="center" justifyContent="center" flexDirection="column">
          <Skeleton style={{ width: '32px', height: '32px' }} />
          <Skeleton style={{ height: '24px', width: '70px' }} />
          <NetworkBadge chainId={chainId} />
        </Box>
        <Box>
          <Text fontWeight="medium" color="text50" fontSize="normal">
            Balance
          </Text>
          <Box flexDirection="row" alignItems="flex-end" justifyContent="space-between">
            <Skeleton style={{ width: '150px', height: '36px' }} />
            <Skeleton style={{ width: '33px', height: '17px' }} />
          </Box>
        </Box>
        <Button
          color="text100"
          marginTop="4"
          marginBottom="10"
          width="full"
          variant="primary"
          leftIcon={SendIcon}
          label="Send"
          disabled
          onClick={() => {}}
        />
        <Box>
          <TransactionHistorySkeleton />
        </Box>
      </Box>
    </Box>
  )
}
