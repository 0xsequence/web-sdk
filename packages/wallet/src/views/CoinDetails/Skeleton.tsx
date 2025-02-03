import { Box, Button, SendIcon, Skeleton, Text } from '@0xsequence/design-system'

import { HEADER_HEIGHT } from '../../constants'
import { NetworkBadge } from '../../shared/NetworkBadge'
import { TransactionHistorySkeleton } from '../../shared/TransactionHistoryList/TransactionHistorySkeleton'

interface CoinDetailsSkeletonProps {
  chainId: number
  isReadOnly: boolean
}

export const CoinDetailsSkeleton = ({ chainId, isReadOnly }: CoinDetailsSkeletonProps) => {
  return (
    <Box style={{ paddingTop: HEADER_HEIGHT }}>
      <Box flexDirection="column" gap="10" paddingBottom="5" paddingX="4" paddingTop="0" style={{ marginTop: '-20px' }}>
        <Box marginBottom="10" gap="2" alignItems="center" justifyContent="center" flexDirection="column">
          <Skeleton style={{ width: '64px', height: '64px' }} />
          <Skeleton style={{ height: '28px', width: '70px' }} />
          <NetworkBadge chainId={chainId} />
        </Box>
        <Box>
          <Text variant="normal" fontWeight="medium" color="text50">
            Balance
          </Text>
          <Box flexDirection="row" alignItems="flex-end" justifyContent="space-between">
            <Skeleton style={{ width: '150px', height: '36px' }} />
            <Skeleton style={{ width: '33px', height: '17px' }} />
          </Box>
        </Box>
        {!isReadOnly && (
          <Button width="full" variant="primary" leftIcon={SendIcon} color="text100" label="Send" disabled onClick={() => {}} />
        )}
        <Box>
          <TransactionHistorySkeleton />
        </Box>
      </Box>
    </Box>
  )
}
