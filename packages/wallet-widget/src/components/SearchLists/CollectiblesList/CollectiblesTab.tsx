import { Spinner, Skeleton, Text } from '@0xsequence/design-system'
import React from 'react'

import { TokenBalanceWithPrice } from '../../../utils'
import { InfiniteScroll } from '../../InfiniteScroll'

import { CollectibleTile } from './CollectibleTile'

interface CollectiblesTabProps {
  displayedCollectibleBalances: TokenBalanceWithPrice[] | undefined
  fetchMoreCollectibleBalances: () => Promise<any>
  hasMoreCollectibleBalances: boolean
  isFetchingMoreCollectibleBalances: boolean
  isFetchingInitialBalances: boolean
  onTokenClick: (token: TokenBalanceWithPrice) => void
  gridColumns?: number
}

export const CollectiblesTab: React.FC<CollectiblesTabProps> = ({
  displayedCollectibleBalances,
  fetchMoreCollectibleBalances,
  hasMoreCollectibleBalances,
  isFetchingMoreCollectibleBalances,
  isFetchingInitialBalances,
  onTokenClick,
  gridColumns
}) => {
  return (
    <div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)`, width: '100%' }}>
        {isFetchingInitialBalances ? (
          <>
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <Skeleton className="w-full" key={i} style={{ height: '180px' }} />
              ))}
          </>
        ) : (
          <>
            {displayedCollectibleBalances && displayedCollectibleBalances.length > 0 && (
              <InfiniteScroll onLoad={() => fetchMoreCollectibleBalances()} hasMore={hasMoreCollectibleBalances}>
                {displayedCollectibleBalances?.map((balance, index) => {
                  return <CollectibleTile key={index} balance={balance} onTokenClick={onTokenClick} />
                })}
              </InfiniteScroll>
            )}
          </>
        )}
      </div>
      {(!displayedCollectibleBalances || displayedCollectibleBalances.length === 0) && !isFetchingMoreCollectibleBalances && (
        <Text color="primary">No Collectibles Found</Text>
      )}
      {isFetchingMoreCollectibleBalances && <Spinner className="flex justify-self-center mt-3" />}
    </div>
  )
}
