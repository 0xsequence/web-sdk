// kit/packages/wallet/src/views/Search/CoinsTab.tsx
import { Spinner, Skeleton, Text } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import React, { useEffect, useRef, useState } from 'react'

import { IndexedData } from '../SearchWalletViewAll'

import { BalanceItem } from './BalanceItem'

interface CoinsTabProps {
  displayedCoinBalances: IndexedData[]
  fetchMoreCoinBalances: () => void
  fetchMoreSearchCoinBalances: () => void
  hasMoreCoins: boolean
  hasMoreSearchCoins: boolean
  isSearching: boolean
  isPending: boolean
  coinBalances: TokenBalance[]
}

export const CoinsTab: React.FC<CoinsTabProps> = ({
  displayedCoinBalances,
  fetchMoreCoinBalances,
  fetchMoreSearchCoinBalances,
  hasMoreCoins,
  hasMoreSearchCoins,
  isSearching,
  isPending,
  coinBalances
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const endOfPageRefCoins = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!endOfPageRefCoins.current) return

    const observer = new IntersectionObserver(entries => {
      const endOfPage = entries[0]
      if (!endOfPage.isIntersecting) return
      if (isSearching && hasMoreSearchCoins) {
        setIsLoading(true)
        setTimeout(() => {
          fetchMoreSearchCoinBalances()
          setIsLoading(false)
        }, 500)
      } else if (!isSearching && hasMoreCoins) {
        setIsLoading(true)
        setTimeout(() => {
          fetchMoreCoinBalances()
          setIsLoading(false)
        }, 500)
      }
    })

    observer.observe(endOfPageRefCoins.current)

    return () => {
      observer.disconnect()
    }
  }, [fetchMoreCoinBalances, fetchMoreSearchCoinBalances, isSearching])

  return (
    <div>
      <div className="flex flex-col gap-3">
        {isPending && (
          <>
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <Skeleton className="w-full h-8" key={i} />
              ))}
          </>
        )}
        {!isPending && displayedCoinBalances.length === 0 && <Text color="primary">No Coins Found</Text>}
        {!isPending &&
          displayedCoinBalances.map((indexItem, index) => {
            const balance = coinBalances[indexItem.index]
            return <BalanceItem key={index} balance={balance} />
          })}
        {isLoading && <Spinner className="flex self-center mt-3" />}
      </div>
      <div ref={endOfPageRefCoins} style={{ height: '1px' }} />
    </div>
  )
}
