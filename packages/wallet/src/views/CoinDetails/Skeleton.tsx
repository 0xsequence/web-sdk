import { Button, SendIcon, Skeleton, Text } from '@0xsequence/design-system'

import { HEADER_HEIGHT } from '../../constants'
import { NetworkBadge } from '../../shared/NetworkBadge'
import { TransactionHistorySkeleton } from '../../shared/TransactionHistoryList/TransactionHistorySkeleton'

interface CoinDetailsSkeletonProps {
  chainId: number
  isReadOnly: boolean
}

export const CoinDetailsSkeleton = ({ chainId, isReadOnly }: CoinDetailsSkeletonProps) => {
  return (
    <div style={{ paddingTop: HEADER_HEIGHT }}>
      <div className="flex flex-col gap-10 pb-5 px-4 pt-0" style={{ marginTop: '-20px' }}>
        <div className="flex mb-10 gap-2 items-center justify-center flex-col">
          <Skeleton style={{ width: '64px', height: '64px' }} />
          <Skeleton style={{ height: '28px', width: '70px' }} />
          <NetworkBadge chainId={chainId} />
        </div>
        <div>
          <Text variant="normal" fontWeight="medium" color="muted">
            Balance
          </Text>
          <div className="flex flex-row items-end justify-between">
            <Skeleton style={{ width: '150px', height: '36px' }} />
            <Skeleton style={{ width: '33px', height: '17px' }} />
          </div>
        </div>
        {!isReadOnly && (
          <Button
            className="w-full text-primary"
            variant="primary"
            leftIcon={SendIcon}
            label="Send"
            disabled
            onClick={() => {}}
          />
        )}
        <div>
          <TransactionHistorySkeleton />
        </div>
      </div>
    </div>
  )
}
