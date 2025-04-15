import { SearchIcon, TextInput, GearIcon, cn, cardVariants } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import Fuse from 'fuse.js'
import { AnimatePresence } from 'motion/react'
import { useState, useMemo } from 'react'

import { TokenBalanceWithPrice, useGetMoreBalances } from '../../utils'
import { FilterMenu } from '../../views/FilterMenu'

import { CollectiblesTab } from './CollectiblesList/CollectiblesTab'

export const CollectiblesList = ({
  tokenBalancesData,
  isPendingTokenBalances,
  onTokenClick,
  enableFilters = true,
  gridColumns = 2
}: {
  tokenBalancesData: TokenBalance[]
  isPendingTokenBalances: boolean
  onTokenClick: (token: TokenBalanceWithPrice) => void
  enableFilters?: boolean
  gridColumns?: number
}) => {
  const pageSize = 8

  const [search, setSearch] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const collectibleBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC721' || b.contractType === 'ERC1155') || []

  const collectibleBalances = collectibleBalancesUnordered.sort((a, b) => {
    return Number(b.balance) - Number(a.balance)
  })

  const collectibleBalancesWithPrice = collectibleBalances.map(balance => ({
    ...balance,
    price: {
      value: 0,
      currency: 'USD'
    }
  }))

  const isPending = isPendingTokenBalances

  const fuseOptions = {
    threshold: 0.1,
    ignoreLocation: true,
    keys: [
      {
        name: 'name',
        getFn: (token: TokenBalance) => {
          return token.tokenMetadata?.name || ''
        }
      },
      {
        name: 'collectionName',
        getFn: (token: TokenBalance) => {
          return token.contractInfo?.name || ''
        }
      }
    ]
  }

  const fuse = useMemo(() => {
    return new Fuse(collectibleBalancesWithPrice, fuseOptions)
  }, [collectibleBalancesWithPrice])

  const searchResults = useMemo(() => {
    if (!search.trimStart()) {
      return []
    }
    return fuse.search(search).map(result => result.item)
  }, [search, fuse])

  const {
    data: infiniteBalances,
    fetchNextPage: fetchMoreBalances,
    hasNextPage: hasMoreBalances,
    isFetching: isFetchingMoreBalances
  } = useGetMoreBalances(collectibleBalancesWithPrice, pageSize, { enabled: search.trim() === '' })

  const {
    data: infiniteSearchBalances,
    fetchNextPage: fetchMoreSearchBalances,
    hasNextPage: hasMoreSearchBalances,
    isFetching: isFetchingMoreSearchBalances
  } = useGetMoreBalances(searchResults, pageSize, { enabled: search.trim() !== '' })

  const onFilterClick = () => {
    setIsFilterOpen(true)
  }

  const onShowCollectibles = () => {
    setIsFilterOpen(false)
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <div className="flex flex-row justify-between items-center w-full gap-2">
        <div className="grow">
          <TextInput
            autoFocus
            name="search wallet"
            leftIcon={SearchIcon}
            value={search}
            onChange={ev => setSearch(ev.target.value)}
            placeholder="Search your wallet"
            data-1p-ignore
          />
        </div>
        {enableFilters && (
          <div className={cn(cardVariants({ clickable: true }), 'bg-background-primary p-0 w-fit')} onClick={onFilterClick}>
            <GearIcon size="lg" color="white" />
          </div>
        )}
      </div>
      <div className="w-full">
        <CollectiblesTab
          displayedCollectibleBalances={search ? infiniteSearchBalances?.pages.flat() : infiniteBalances?.pages.flat()}
          fetchMoreCollectibleBalances={search ? fetchMoreSearchBalances : fetchMoreBalances}
          hasMoreCollectibleBalances={search ? hasMoreSearchBalances : hasMoreBalances}
          isFetchingMoreCollectibleBalances={search ? isFetchingMoreSearchBalances : isFetchingMoreBalances}
          isFetchingInitialBalances={isPending}
          onTokenClick={onTokenClick}
          gridColumns={gridColumns}
        />
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <FilterMenu
            onClose={() => setIsFilterOpen(false)}
            label="Collectible Filters"
            buttonLabel="Show Collectibles"
            type="collectibles"
            handleButtonPress={onShowCollectibles}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
