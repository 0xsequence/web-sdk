import { Spinner, Skeleton, Text } from '@0xsequence/design-system'
import React from 'react'

import { TokenBalanceWithPrice } from '../../../utils/tokens'
import { InfiniteScroll } from '../../InfiniteScroll'

import { CoinRow } from './CoinRow'

interface CoinsTabProps {
  displayedCoinBalances: TokenBalanceWithPrice[] | undefined
  fetchMoreCoinBalances: () => Promise<any>
  hasMoreCoinBalances: boolean
  isFetchingMoreCoinBalances: boolean
  isFetchingInitialBalances: boolean
  onTokenClick: (token: TokenBalanceWithPrice) => void
  includeUserAddress?: boolean
}

export const CoinsTab: React.FC<CoinsTabProps> = ({
  displayedCoinBalances,
  fetchMoreCoinBalances,
  hasMoreCoinBalances,
  isFetchingMoreCoinBalances,
  isFetchingInitialBalances,
  onTokenClick,
  includeUserAddress = false
}) => {
  return (
    <div>
      <div className="flex flex-col items-center gap-2">
        {isFetchingInitialBalances ? (
          <>
            {Array(7)
              .fill(null)
              .map((_, i) => (
                <Skeleton className="w-full" key={i} style={{ height: '60px' }} />
              ))}
          </>
        ) : (
          <>
            {(!displayedCoinBalances || displayedCoinBalances.length === 0) && !isFetchingMoreCoinBalances ? (
              <Text color="primary">No Coins Found</Text>
            ) : (
              <InfiniteScroll onLoad={() => fetchMoreCoinBalances()} hasMore={hasMoreCoinBalances}>
                {displayedCoinBalances?.map((balance, index) => {
                  return (
                    <CoinRow key={index} balance={balance} onTokenClick={onTokenClick} includeUserAddress={includeUserAddress} />
                  )
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
