import { Button, SendIcon, Skeleton, SwapIcon, Text } from '@0xsequence/design-system'

import { NetworkBadge } from '../../components/NetworkBadge.js'
import { TransactionHistorySkeleton } from '../../components/TransactionHistoryList/TransactionHistorySkeleton.js'

interface CoinDetailsSkeletonProps {
  chainId: number
  isReadOnly: boolean
}

export const CoinDetailsSkeleton = ({ chainId, isReadOnly }: CoinDetailsSkeletonProps) => {
  return (
    <div>
      <div className="flex flex-col gap-10 pb-5 px-4 pt-0">
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
          <div className="flex gap-2">
            <Button
              className="w-full text-primary bg-background-secondary"
              leftIcon={SendIcon}
              label="Send"
              disabled
              onClick={() => {}}
            />
            <Button
              className="w-full text-primary bg-background-secondary"
              leftIcon={SwapIcon}
              label="Swap"
              disabled
              onClick={() => {}}
            />
          </div>
        )}
        <div>
          <TransactionHistorySkeleton />
        </div>
      </div>
    </div>
  )
}
