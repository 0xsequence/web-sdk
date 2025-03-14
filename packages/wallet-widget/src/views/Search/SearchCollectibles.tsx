import { SearchIcon, TextInput, GearIcon, cn, cardVariants } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import { ContractVerificationStatus } from '@0xsequence/react-connect'
import { useGetTokenBalancesDetails } from '@0xsequence/react-hooks'
import Fuse from 'fuse.js'
import { AnimatePresence } from 'motion/react'
import { useState, useMemo } from 'react'
import { useAccount } from 'wagmi'

import { useSettings } from '../../hooks'
import { getMoreBalances } from '../../utils'
import { FilterMenu } from '../FilterMenu'

import { CollectiblesTab } from './components/CollectiblesTab'

export const SearchCollectibles = () => {
  const pageSize = 8

  const { address: accountAddress } = useAccount()
  const { hideUnlistedTokens, selectedNetworks } = useSettings()

  const [search, setSearch] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { data: tokenBalancesData, isPending: isPendingTokenBalances } = useGetTokenBalancesDetails({
    chainIds: selectedNetworks,
    filter: {
      accountAddresses: accountAddress ? [accountAddress] : [],
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      omitNativeBalances: false
    }
  })

  const collectibleBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC721' || b.contractType === 'ERC1155') || []

  const collectibleBalances = collectibleBalancesUnordered.sort((a, b) => {
    return Number(b.balance) - Number(a.balance)
  })

  const isPending = isPendingTokenBalances

  const fuseOptions = {
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
    ],
    ignoreLocation: true
  }

  const fuse = useMemo(() => {
    return new Fuse(collectibleBalances, fuseOptions)
  }, [collectibleBalances])

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
  } = getMoreBalances(collectibleBalances, pageSize, { enabled: search.trim() === '' })

  const {
    data: infiniteSearchBalances,
    fetchNextPage: fetchMoreSearchBalances,
    hasNextPage: hasMoreSearchBalances,
    isFetching: isFetchingMoreSearchBalances
  } = getMoreBalances(searchResults, pageSize, { enabled: search.trim() !== '' })

  const onFilterClick = () => {
    setIsFilterOpen(true)
  }

  return (
    <div className="flex px-4 pb-5 pt-3 flex-col gap-5 items-center justify-center">
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
        <div className={cn(cardVariants({ clickable: true }), 'bg-background-primary p-0 w-fit')} onClick={onFilterClick}>
          <GearIcon size="lg" color="white" />
        </div>
      </div>
      <div className="w-full">
        <CollectiblesTab
          displayedCollectibleBalances={search ? infiniteSearchBalances?.pages.flat() : infiniteBalances?.pages.flat()}
          fetchMoreCollectibleBalances={search ? fetchMoreSearchBalances : fetchMoreBalances}
          hasMoreCollectibleBalances={search ? hasMoreSearchBalances : hasMoreBalances}
          isFetchingMoreCollectibleBalances={search ? isFetchingMoreSearchBalances : isFetchingMoreBalances}
          isFetchingInitialBalances={isPending}
        />
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <FilterMenu
            onClose={() => setIsFilterOpen(false)}
            label="Collectible Filters"
            buttonLabel="Show Collectibles"
            type="collectibles"
            handleButtonPress={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
