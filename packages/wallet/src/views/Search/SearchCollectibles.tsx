import { SearchIcon, TextInput, GearIcon } from '@0xsequence/design-system'
import { ContractVerificationStatus } from '@0xsequence/kit'
import Fuse from 'fuse.js'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

import { useNavigation, useSettings } from '../../hooks'

import { CollectiblesTab } from './components/CollectiblesTab'
import { useGetTokenBalancesDetails } from '@0xsequence/kit-hooks'
import { IndexedData } from './SearchTokens'

export const SearchCollectibles = () => {
  const { setNavigation } = useNavigation()
  const { hideUnlistedTokens, selectedNetworks } = useSettings()
  const [search, setSearch] = useState('')

  const pageSize = 20
  const [displayedCollectibleBalances, setDisplayedCollectibleBalances] = useState<IndexedData[]>([])

  const [displayedSearchCollectibleBalances, setDisplayedSearchCollectibleBalances] = useState<IndexedData[]>([])

  const [initCollectiblesFlag, setInitCollectiblesFlag] = useState(false)

  const [hasMoreCollectibles, sethasMoreCollectibles] = useState(false)

  const [hasMoreSearchCollectibles, sethasMoreSearchCollectibles] = useState(false)

  const { address: accountAddress } = useAccount()

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

  const indexedCollectibleBalances: IndexedData[] = collectibleBalances.map((balance, index) => ({
    index,
    name: balance.tokenMetadata?.name || 'Unknown'
  }))

  useEffect(() => {
    if (!initCollectiblesFlag && indexedCollectibleBalances.length > 0) {
      setDisplayedCollectibleBalances(indexedCollectibleBalances.slice(0, pageSize))
      sethasMoreCollectibles(indexedCollectibleBalances.length > pageSize)
      setInitCollectiblesFlag(true)
    }
  }, [initCollectiblesFlag, isPendingTokenBalances])

  useEffect(() => {
    if (search !== '') {
      setDisplayedSearchCollectibleBalances(
        fuzzySearchCollectibles
          .search(search)
          .map(result => result.item)
          .slice(0, pageSize)
      )
      sethasMoreSearchCollectibles(fuzzySearchCollectibles.search(search).length > pageSize)
    }
  }, [search])

  const fetchMoreCollectibleBalances = () => {
    if (displayedCollectibleBalances.length >= indexedCollectibleBalances.length) {
      sethasMoreCollectibles(false)
      return
    }
    setDisplayedCollectibleBalances(indexedCollectibleBalances.slice(0, displayedCollectibleBalances.length + pageSize))
  }

  const fetchMoreSearchCollectibleBalances = () => {
    if (displayedSearchCollectibleBalances.length >= fuzzySearchCollectibles.search(search).length) {
      sethasMoreSearchCollectibles(false)
      return
    }
    setDisplayedSearchCollectibleBalances(
      fuzzySearchCollectibles
        .search(search)
        .map(result => result.item)
        .slice(0, displayedSearchCollectibleBalances.length + pageSize)
    )
  }

  const fuzzySearchCollectibles = new Fuse(indexedCollectibleBalances, {
    keys: ['name']
  })

  const onFilterClick = () => {
    setNavigation && setNavigation({
      location: 'filter-collectibles'
    })
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
        <GearIcon size="lg" color="white" onClick={onFilterClick}/>
      </div>
      <div className="w-full">
        <CollectiblesTab
          displayedCollectibleBalances={search ? displayedSearchCollectibleBalances : displayedCollectibleBalances}
          fetchMoreCollectibleBalances={fetchMoreCollectibleBalances}
          fetchMoreSearchCollectibleBalances={fetchMoreSearchCollectibleBalances}
          hasMoreCollectibles={hasMoreCollectibles}
          hasMoreSearchCollectibles={hasMoreSearchCollectibles}
          isSearching={search !== ''}
          isPending={isPendingTokenBalances}
          collectibleBalances={collectibleBalances}
        />
      </div>
    </div>
  )
}
