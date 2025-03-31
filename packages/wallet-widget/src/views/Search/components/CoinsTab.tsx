import { Spinner, Skeleton, Text } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import React from 'react'

import { InfiniteScroll } from '../../../components/InfiniteScroll'

import { CoinRow } from './CoinRow'

interface CoinsTabProps {
  displayedCoinBalances: TokenBalance[] | undefined
  fetchMoreCoinBalances: () => Promise<any>
  hasMoreCoinBalances: boolean
  isFetchingMoreCoinBalances: boolean
  isFetchingInitialBalances: boolean
}

export const CoinsTab: React.FC<CoinsTabProps> = ({
  displayedCoinBalances,
  fetchMoreCoinBalances,
  hasMoreCoinBalances,
  isFetchingMoreCoinBalances,
  isFetchingInitialBalances
}) => {
  return (
    <div>
      <div className="flex flex-col items-center gap-3">
        {isFetchingInitialBalances ? (
          <>
            {Array(12)
              .fill(null)
              .map((_, i) => (
                <Skeleton className="w-full h-8" key={i} />
              ))}
          </>
        ) : (
          <>
            {!displayedCoinBalances || displayedCoinBalances.length === 0 ? (
              <Text color="primary">No Coins Found</Text>
            ) : (
              <InfiniteScroll onLoad={() => fetchMoreCoinBalances()} hasMore={hasMoreCoinBalances}>
                {displayedCoinBalances?.map((balance, index) => {
                  return <CoinRow key={index} balance={balance} />
                })}
              </InfiniteScroll>
            )}
          </>
        )}
        {isFetchingMoreCoinBalances && <Spinner className="flex self-center mt-3" />}
      </div>
    </div>
  )
}
