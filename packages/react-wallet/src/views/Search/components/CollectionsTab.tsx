import { Spinner, Skeleton, Text } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import React, { useEffect, useRef, useState } from 'react'

import { IndexedData } from '../SearchWalletViewAll'

import { BalanceItem } from './BalanceItem'

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

export const CollectionsTab: React.FC<CollectionsTabProps> = ({
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
    if (!endOfPageRefCollections.current) {
      return
    }

    const observer = new IntersectionObserver(entries => {
      const endOfPage = entries[0]
      if (!endOfPage.isIntersecting) {
        return
      }
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
        {!isPending && displayedCollectionBalances.length === 0 && <Text color="primary">No Collectibles Found</Text>}
        {!isPending &&
          displayedCollectionBalances.map((indexItem, index) => {
            const balance = collectionBalances[indexItem.index]
            return <BalanceItem key={index} balance={balance} />
          })}
        {isLoading && <Spinner className="flex self-center mt-3" />}
      </div>
      <div ref={endOfPageRefCollections} style={{ height: '1px' }} />
    </div>
  )
}
