// kit/packages/wallet/src/views/Search/CollectionsTab.tsx
import React, { useEffect, useRef, useState } from 'react'
import { BalanceItem } from './BalanceItem'
import { Spinner, Skeleton, Text, Box } from '@0xsequence/design-system'
import { IndexedData } from '../SearchWalletViewAll'
import { TokenBalance } from '@0xsequence/indexer'

interface CollectionsTabProps {
  displayedCollectionBalances: IndexedData[]
  fetchMoreCollectionBalances: () => void
  fetchMoreSearchCollectionBalances: () => void
  hasMoreCollections: boolean
  hasMoreSearchCollections: boolean
  isSearching: boolean
  isPending: boolean
  collectionBalances: TokenBalance[]
}

const CollectionsTab: React.FC<CollectionsTabProps> = ({
  displayedCollectionBalances,
  fetchMoreCollectionBalances,
  fetchMoreSearchCollectionBalances,
  hasMoreCollections,
  hasMoreSearchCollections,
  isSearching,
  isPending,
  collectionBalances
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const endOfPageRefCollections = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!endOfPageRefCollections.current) return

    const observer = new IntersectionObserver(entries => {
      const endOfPage = entries[0]
      if (!endOfPage.isIntersecting) return
      if (isSearching && hasMoreSearchCollections) {
        setIsLoading(true)
        setTimeout(() => {
          fetchMoreSearchCollectionBalances()
          setIsLoading(false)
        }, 500)
      } else if (!isSearching && hasMoreCollections) {
        setIsLoading(true)
        setTimeout(() => {
          fetchMoreCollectionBalances()
          setIsLoading(false)
        }, 500)
      }
    })
    observer.observe(endOfPageRefCollections.current)

    return () => {
      observer.disconnect()
    }
  }, [fetchMoreCollectionBalances, fetchMoreSearchCollectionBalances, isSearching])

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
        {!isPending && displayedCollectionBalances.length === 0 && <Text color="text100">No Collectibles Found</Text>}
        {!isPending &&
          displayedCollectionBalances.map((indexItem, index) => {
            const balance = collectionBalances[indexItem.index]
            return <BalanceItem key={index} balance={balance} />
          })}
        {isLoading && <Spinner alignSelf="center" marginTop="3" />}
      </Box>
      <div ref={endOfPageRefCollections} style={{ height: '1px' }} />
    </Box>
  )
}

export default CollectionsTab
