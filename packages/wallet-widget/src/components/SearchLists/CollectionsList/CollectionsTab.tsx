import { Skeleton, Spinner } from '@0xsequence/design-system'
import type { ContractInfo } from '@0xsequence/indexer'
import type { FC } from 'react'

import { InfiniteScroll } from '../../InfiniteScroll.js'
import { NoResults } from '../../NoResults.js'

import { CollectionTile } from './CollectionTile.js'

interface CollectionsTabProps {
  displayedCollectibleBalances: ContractInfo[] | undefined
  fetchMoreCollectibleBalances: () => Promise<any>
  hasMoreCollectibleBalances: boolean
  isFetchingMoreCollectibleBalances: boolean
  isFetchingInitialBalances: boolean
  onTokenClick: (token: ContractInfo) => void
}

export const CollectionsTab: FC<CollectionsTabProps> = ({
  displayedCollectibleBalances,
  fetchMoreCollectibleBalances,
  hasMoreCollectibleBalances,
  isFetchingMoreCollectibleBalances,
  isFetchingInitialBalances,
  onTokenClick
}) => {
  const hasBalances = displayedCollectibleBalances && displayedCollectibleBalances.length > 0

  return (
    <div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(3, 1fr)`, width: '100%' }}>
        {isFetchingInitialBalances
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton className="w-full aspect-square rounded-lg" key={i} />)
          : hasBalances && (
              <InfiniteScroll onLoad={fetchMoreCollectibleBalances} hasMore={hasMoreCollectibleBalances}>
                {displayedCollectibleBalances!.map((balance, index) => (
                  <CollectionTile key={index} balance={balance} onTokenClick={onTokenClick} />
                ))}
              </InfiniteScroll>
            )}
      </div>
      {!isFetchingInitialBalances && !hasBalances && !isFetchingMoreCollectibleBalances && <NoResults />}
      {isFetchingMoreCollectibleBalances && <Spinner className="flex justify-self-center mt-3" />}
    </div>
  )
}
