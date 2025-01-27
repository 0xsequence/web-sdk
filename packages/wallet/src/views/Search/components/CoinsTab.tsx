// kit/packages/wallet/src/views/Search/CoinsTab.tsx
import React, { useEffect, useRef, useState } from 'react'
import { BalanceItem } from './BalanceItem'
import { Spinner, Skeleton, Text, Box } from '@0xsequence/design-system'
import { IndexedData } from '../SearchWalletViewAll'
import { TokenBalance } from '@0xsequence/indexer'

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

const CoinsTab: React.FC<CoinsTabProps> = ({
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
    <Box>
      <Box flexDirection="column" gap="3">
        {isPending && (
          <>
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <Skeleton key={i} width="full" height="8" />
              ))}
          </>
        )}
        {!isPending && displayedCoinBalances.length === 0 && <Text color="text100">No Coins Found</Text>}
        {!isPending &&
          displayedCoinBalances.map((indexItem, index) => {
            const balance = coinBalances[indexItem.index]
            return <BalanceItem key={index} balance={balance} />
          })}
        {isLoading && <Spinner alignSelf="center" marginTop="3" />}
      </Box>
      <div ref={endOfPageRefCoins} style={{ height: '1px' }} />
    </Box>
  )
}

export default CoinsTab
