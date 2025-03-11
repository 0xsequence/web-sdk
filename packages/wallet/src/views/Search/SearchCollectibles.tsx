import { SearchIcon, TextInput } from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId, ContractVerificationStatus, compareAddress } from '@0xsequence/kit'
import { ethers } from 'ethers'
import Fuse from 'fuse.js'
import { useState, useEffect } from 'react'
import { useAccount, useConfig } from 'wagmi'

import { useSettings } from '../../hooks'
import { computeBalanceFiat } from '../../utils'

import { CollectionsTab } from './components/CollectionsTab'
import { useGetTokenBalancesSummary, useGetCoinPrices, useGetExchangeRate } from '@0xsequence/kit-hooks'
import { IndexedData } from './SearchTokens'

export const SearchCollectibles = () => {
  const { chains } = useConfig()
  const { fiatCurrency, hideUnlistedTokens, selectedNetworks } = useSettings()
  const [search, setSearch] = useState('')

  const pageSize = 20
  const [displayedCollectionBalances, setDisplayedCollectionBalances] = useState<IndexedData[]>([])

  const [displayedSearchCollectionBalances, setDisplayedSearchCollectionBalances] = useState<IndexedData[]>([])

  const [initCollectionsFlag, setInitCollectionsFlag] = useState(false)

  const [hasMoreCollections, sethasMoreCollections] = useState(false)

  const [hasMoreSearchCollections, sethasMoreSearchCollections] = useState(false)

  const { address: accountAddress } = useAccount()

  const { data: tokenBalancesData, isPending: isPendingTokenBalances } = useGetTokenBalancesSummary({
    chainIds: selectedNetworks,
    filter: {
      accountAddresses: accountAddress ? [accountAddress] : [],
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      omitNativeBalances: false
    }
  })

  const collectionBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC721' || b.contractType === 'ERC1155') || []

  const collectionBalances = collectionBalancesUnordered.sort((a, b) => {
    return Number(b.balance) - Number(a.balance)
  })

  const collectionBalancesAmount = collectionBalances.length

  const isPending = isPendingTokenBalances

  const indexedCollectionBalances: IndexedData[] = collectionBalances.map((balance, index) => ({
    index,
    name: balance.contractInfo?.name || 'Unknown'
  }))

  useEffect(() => {
    if (!initCollectionsFlag && indexedCollectionBalances.length > 0) {
      setDisplayedCollectionBalances(indexedCollectionBalances.slice(0, pageSize))
      sethasMoreCollections(indexedCollectionBalances.length > pageSize)
      setInitCollectionsFlag(true)
    }
  }, [initCollectionsFlag])

  useEffect(() => {
    if (search !== '') {
      setDisplayedSearchCollectionBalances(
        fuzzySearchCollections
          .search(search)
          .map(result => result.item)
          .slice(0, pageSize)
      )
      sethasMoreSearchCollections(fuzzySearchCollections.search(search).length > pageSize)
    }
  }, [search])

  const fetchMoreCollectionBalances = () => {
    if (displayedCollectionBalances.length >= indexedCollectionBalances.length) {
      sethasMoreCollections(false)
      return
    }
    setDisplayedCollectionBalances(indexedCollectionBalances.slice(0, displayedCollectionBalances.length + pageSize))
  }

  const fetchMoreSearchCollectionBalances = () => {
    if (displayedSearchCollectionBalances.length >= fuzzySearchCollections.search(search).length) {
      sethasMoreSearchCollections(false)
      return
    }
    setDisplayedSearchCollectionBalances(
      fuzzySearchCollections
        .search(search)
        .map(result => result.item)
        .slice(0, displayedSearchCollectionBalances.length + pageSize)
    )
  }

  const fuzzySearchCollections = new Fuse(indexedCollectionBalances, {
    keys: ['name']
  })

  return (
    <div className="flex px-4 pb-5 pt-3 flex-col gap-5 items-center justify-center">
      <div className="w-full">
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
      <div className="w-full">
        <CollectionsTab
          displayedCollectionBalances={search ? displayedSearchCollectionBalances : displayedCollectionBalances}
          fetchMoreCollectionBalances={fetchMoreCollectionBalances}
          fetchMoreSearchCollectionBalances={fetchMoreSearchCollectionBalances}
          hasMoreCollections={hasMoreCollections}
          hasMoreSearchCollections={hasMoreSearchCollections}
          isSearching={search !== ''}
          isPending={isPending}
          collectionBalances={collectionBalances}
        />
      </div>
    </div>
  )
}
