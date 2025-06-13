import { Skeleton, Spinner } from '@0xsequence/design-system'
import type { FC } from 'react'

import type { TokenBalanceWithDetails } from '../../../utils/tokens.js'
import { InfiniteScroll } from '../../InfiniteScroll.js'
import { NoResults } from '../../NoResults.js'

import { CoinRow } from './CoinRow.js'

interface CoinsTabProps {
  displayedCoinBalances: TokenBalanceWithDetails[] | undefined
  fetchMoreCoinBalances: () => Promise<any>
  hasMoreCoinBalances: boolean
  isFetchingMoreCoinBalances: boolean
  isFetchingInitialBalances: boolean
  onTokenClick: (token: TokenBalanceWithDetails) => void
  includeUserAddress?: boolean
}

export const CoinsTab: FC<CoinsTabProps> = ({
  displayedCoinBalances,
  fetchMoreCoinBalances,
  hasMoreCoinBalances,
  isFetchingMoreCoinBalances,
  isFetchingInitialBalances,
  onTokenClick,
  includeUserAddress = false
}) => {
  const hasBalances = displayedCoinBalances && displayedCoinBalances.length > 0

  return (
    <div>
      <div className="flex flex-col items-center gap-2" style={{ marginBottom: '-8px' }}>
        {isFetchingInitialBalances
          ? Array.from({ length: 7 }).map((_, i) => <Skeleton className="w-full" key={i} style={{ height: '68px' }} />)
          : hasBalances && (
              <InfiniteScroll onLoad={fetchMoreCoinBalances} hasMore={hasMoreCoinBalances}>
                {displayedCoinBalances!.map((balance, index) => (
                  <CoinRow key={index} balance={balance} onTokenClick={onTokenClick} includeUserAddress={includeUserAddress} />
                ))}
              </InfiniteScroll>
            )}
      </div>
      {!isFetchingInitialBalances && !hasBalances && !isFetchingMoreCoinBalances && <NoResults hasInstructions />}
      {isFetchingMoreCoinBalances && <Spinner className="flex self-center mt-3" />}
    </div>
  )
}
