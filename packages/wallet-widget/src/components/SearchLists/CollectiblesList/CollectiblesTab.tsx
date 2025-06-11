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
  const hasBalances = displayedCollectibleBalances && displayedCollectibleBalances.length > 0

  return (
    <div className="flex flex-col">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(3, 1fr)`, width: '100%' }}>
        {isFetchingInitialBalances
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton className="w-full aspect-square rounded-lg" key={i} />)
          : hasBalances && (
              <InfiniteScroll onLoad={fetchMoreCollectibleBalances} hasMore={hasMoreCollectibleBalances}>
                {displayedCollectibleBalances!.map((balance, index) => (
                  <CollectibleTile key={index} balance={balance} onTokenClick={onTokenClick} />
                ))}
              </InfiniteScroll>
            )}
      </div>
      {!isFetchingInitialBalances && !hasBalances && !isFetchingMoreCollectibleBalances && <NoResults hasInstructions />}
      {isFetchingMoreCollectibleBalances && <Spinner className="flex justify-self-center mt-3" />}
    </div>
  )
}
