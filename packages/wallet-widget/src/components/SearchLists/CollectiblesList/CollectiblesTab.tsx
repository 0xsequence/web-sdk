import { Skeleton, Spinner } from '@0xsequence/design-system'
import type { FC } from 'react'

import type { TokenBalanceWithDetails } from '../../../utils/index.js'
import { InfiniteScroll } from '../../InfiniteScroll.js'
import { NoResults } from '../../NoResults.js'

import { CollectibleTile } from './CollectibleTile.js'

interface CollectiblesTabProps {
  displayedCollectibleBalances: TokenBalanceWithDetails[] | undefined
  fetchMoreCollectibleBalances: () => Promise<any>
  hasMoreCollectibleBalances: boolean
  isFetchingMoreCollectibleBalances: boolean
  isFetchingInitialBalances: boolean
  onTokenClick: (token: TokenBalanceWithDetails) => void
}

export const CollectiblesTab: FC<CollectiblesTabProps> = ({
  displayedCollectibleBalances,
  fetchMoreCollectibleBalances,
  hasMoreCollectibleBalances,
  isFetchingMoreCollectibleBalances,
  isFetchingInitialBalances,
  onTokenClick
}) => {
  return (
    <div className="flex flex-col">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(3, 1fr)`, width: '100%' }}>
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
        <NoResults />
      )}
      {isFetchingMoreCollectibleBalances && <Spinner className="flex justify-self-center mt-3" />}
    </div>
  )
}
