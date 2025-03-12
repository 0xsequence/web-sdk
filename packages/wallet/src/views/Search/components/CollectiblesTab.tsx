// kit/packages/wallet/src/views/Search/CollectionsTab.tsx
import { Spinner, Skeleton, Text } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import React, { useEffect, useRef, useState } from 'react'

import { IndexedData } from '../SearchTokens'

import { CollectibleTile } from './CollectibleTile'
import { useNavigation } from '../../../hooks'

interface CollectiblesTabProps {
  displayedCollectibleBalances: IndexedData[]
  fetchMoreCollectibleBalances: () => void
  fetchMoreSearchCollectibleBalances: () => void
  hasMoreCollectibles: boolean
  hasMoreSearchCollectibles: boolean
  isSearching: boolean
  isPending: boolean
  collectibleBalances: TokenBalance[]
}

export const CollectiblesTab: React.FC<CollectiblesTabProps> = ({
  displayedCollectibleBalances,
  fetchMoreCollectibleBalances,
  fetchMoreSearchCollectibleBalances,
  hasMoreCollectibles,
  hasMoreSearchCollectibles,
  isSearching,
  isPending,
  collectibleBalances
}) => {
  const { setNavigation } = useNavigation()
  const [isLoading, setIsLoading] = useState(false)

  const endOfPageRefCollectibles = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!endOfPageRefCollectibles.current) return

    const observer = new IntersectionObserver(entries => {
      const endOfPage = entries[0]
      if (!endOfPage.isIntersecting) return
      if (isSearching && hasMoreSearchCollectibles) {
        setIsLoading(true)
        setTimeout(() => {
          fetchMoreSearchCollectibleBalances()
          setIsLoading(false)
        }, 500)
      } else if (!isSearching && hasMoreCollectibles) {
        setIsLoading(true)
        setTimeout(() => {
          fetchMoreCollectibleBalances()
          setIsLoading(false)
        }, 500)
      }
    })
    observer.observe(endOfPageRefCollectibles.current)

    return () => {
      observer.disconnect()
    }
  }, [fetchMoreCollectibleBalances, fetchMoreSearchCollectibleBalances, isSearching])

  const onClickItem = (balance: TokenBalance) => {
    setNavigation &&
      setNavigation({
        location: 'collectible-details',
        params: { contractAddress: balance.contractAddress, chainId: balance.chainId, tokenId: balance.tokenID || '' }
      })
  }

  return (
    <div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `calc(50% - 4px) calc(50% - 4px)` }}>
        {isPending && (
          <>
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <Skeleton className="w-full h-8" key={i} />
              ))}
          </>
        )}
        {!isPending && displayedCollectibleBalances.length === 0 && <Text color="primary">No Collectibles Found</Text>}
        {!isPending &&
          displayedCollectibleBalances.map((indexItem, index) => {
            const balance = collectibleBalances[indexItem.index]
            return (
              <div className="select-none cursor-pointer aspect-square" key={index} onClick={() => onClickItem(balance)}>
                <CollectibleTile balance={balance} />
              </div>
            )
          })}
        {isLoading && <Spinner className="flex justify-self-center mt-3" />}
      </div>
      <div ref={endOfPageRefCollectibles} style={{ height: '1px' }} />
    </div>
  )
}
