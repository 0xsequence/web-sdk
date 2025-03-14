import { Spinner, Skeleton, Text } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import React from 'react'

import { InfiniteScroll } from '../../../components/InfiniteScroll'

import { CollectibleTile } from './CollectibleTile'

interface CollectiblesTabProps {
  displayedCollectibleBalances: TokenBalance[] | undefined
  fetchMoreCollectibleBalances: () => Promise<any>
  hasMoreCollectibleBalances: boolean
  isFetchingMoreCollectibleBalances: boolean
  isFetchingInitialBalances: boolean
}

export const CollectiblesTab: React.FC<CollectiblesTabProps> = ({
  displayedCollectibleBalances,
  fetchMoreCollectibleBalances,
  hasMoreCollectibleBalances,
  isFetchingMoreCollectibleBalances,
  isFetchingInitialBalances
}) => {
  return (
    <div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `calc(50% - 4px) calc(50% - 4px)` }}>
        {isFetchingInitialBalances ? (
          <>
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <Skeleton className="w-full h-8" key={i} />
              ))}
          </>
        ) : (
          <>
            {!displayedCollectibleBalances || displayedCollectibleBalances.length === 0 ? (
              <Text color="primary">No Collectibles Found</Text>
            ) : (
              <InfiniteScroll onLoad={() => fetchMoreCollectibleBalances()} hasMore={hasMoreCollectibleBalances}>
                {displayedCollectibleBalances?.map((balance, index) => {
                  return <CollectibleTile key={index} balance={balance} />
                })}
              </InfiniteScroll>
            )}
          </>
        )}
        {isFetchingMoreCollectibleBalances && <Spinner className="flex justify-self-center mt-3" />}
      </div>
    </div>
  )
}
