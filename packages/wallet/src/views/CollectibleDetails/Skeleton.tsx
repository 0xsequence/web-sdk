import { Button, SendIcon, Skeleton, Text } from '@0xsequence/design-system'

import { HEADER_HEIGHT } from '../../constants'
import { TransactionHistorySkeleton } from '../../shared/TransactionHistoryList/TransactionHistorySkeleton'

interface CollectibleDetailsSkeletonProps {
  isReadOnly: boolean
}

export const CollectibleDetailsSkeleton = ({ isReadOnly }: CollectibleDetailsSkeletonProps) => {
  return (
    <div style={{ paddingTop: HEADER_HEIGHT }}>
      <div
        className="flex flex-col gap-10 pb-5 px-4 pt-0"
        style={{
          marginTop: '-20px'
        }}
      >
        <div className="flex gap-3 items-center justify-center flex-col">
          <Skeleton style={{ width: '120px', height: '16px' }} />
          <Skeleton style={{ width: '140px', height: '44px' }} />
        </div>
        <div>
          <Skeleton style={{ width: '100%', aspectRatio: '1/1' }} />
        </div>
        <div>
          {/* balance */}
          <div>
            <Text variant="normal" fontWeight="medium" color="muted">
              Balance
            </Text>
            <div className="flex flex-row items-end justify-between">
              <Skeleton style={{ width: '44px', height: '36px' }} />
              <Skeleton style={{ width: '34px', height: '17px' }} />
            </div>
          </div>
          {!isReadOnly && (
            <Button className="text-primary mt-4 w-full" variant="primary" leftIcon={SendIcon} label="Send" onClick={() => {}} />
          )}
        </div>
        <div>
          <Text variant="normal" color="muted" fontWeight="medium">
            This week
          </Text>
          <TransactionHistorySkeleton />
        </div>
      </div>
    </div>
  )
}
