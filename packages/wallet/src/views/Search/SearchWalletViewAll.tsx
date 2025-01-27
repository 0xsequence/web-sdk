import { Box, SearchIcon, Skeleton, TabsContent, TabsHeader, TabsRoot, TextInput } from '@0xsequence/design-system'
import {
  getNativeTokenInfoByChainId,
  useExchangeRate,
  useCoinPrices,
  useBalancesSummary,
  ContractVerificationStatus
} from '@0xsequence/kit'
import { ethers } from 'ethers'
import Fuse from 'fuse.js'
import { useState, useEffect } from 'react'
import { useAccount, useConfig } from 'wagmi'

import { useSettings } from '../../hooks'
import { compareAddress, computeBalanceFiat } from '../../utils'

import CoinsTab from './components/CoinsTab'
import CollectionsTab from './components/CollectionsTab'

interface SearchWalletViewAllProps {
  defaultTab: 'coins' | 'collections'
}

export interface IndexedData {
  index: number
  name: string
}

export const SearchWalletViewAll = ({ defaultTab }: SearchWalletViewAllProps) => {
  const { chains } = useConfig()
  const { fiatCurrency, hideUnlistedTokens, selectedNetworks } = useSettings()
  const [search, setSearch] = useState('')
  const [selectedTab, setSelectedTab] = useState(defaultTab)

  const pageSize = 20
  const [displayedCoinBalances, setDisplayedCoinBalances] = useState<IndexedData[]>([])
  const [displayedCollectionBalances, setDisplayedCollectionBalances] = useState<IndexedData[]>([])

  const [displayedSearchCoinBalances, setDisplayedSearchCoinBalances] = useState<IndexedData[]>([])
  const [displayedSearchCollectionBalances, setDisplayedSearchCollectionBalances] = useState<IndexedData[]>([])

  const [initCoinsFlag, setInitCoinsFlag] = useState(false)
  const [initCollectionsFlag, setInitCollectionsFlag] = useState(false)

  const [hasMoreCoins, sethasMoreCoins] = useState(false)
  const [hasMoreCollections, sethasMoreCollections] = useState(false)

  const [hasMoreSearchCoins, sethasMoreSearchCoins] = useState(false)
  const [hasMoreSearchCollections, sethasMoreSearchCollections] = useState(false)

  const { address: accountAddress } = useAccount()

  const { data: tokenBalancesData, isPending: isPendingTokenBalances } = useBalancesSummary({
    chainIds: selectedNetworks,
    filter: {
      accountAddresses: accountAddress ? [accountAddress] : [],
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      contractWhitelist: [],
      contractBlacklist: []
    }
  })

  const coinBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC20' || compareAddress(b.contractAddress, ethers.ZeroAddress)) || []

  const { data: coinPrices = [], isPending: isPendingCoinPrices } = useCoinPrices(
    coinBalancesUnordered.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  )

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useExchangeRate(fiatCurrency.symbol)

  const coinBalances = coinBalancesUnordered.sort((a, b) => {
    const fiatA = computeBalanceFiat({
      balance: a,
      prices: coinPrices,
      conversionRate,
      decimals: a.contractInfo?.decimals || 18
    })
    const fiatB = computeBalanceFiat({
      balance: b,
      prices: coinPrices,
      conversionRate,
      decimals: b.contractInfo?.decimals || 18
    })
    return Number(fiatB) - Number(fiatA)
  })

  const collectionBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC721' || b.contractType === 'ERC1155') || []

  const collectionBalances = collectionBalancesUnordered.sort((a, b) => {
    return Number(b.balance) - Number(a.balance)
  })

  const coinBalancesAmount = coinBalances.length
  const collectionBalancesAmount = collectionBalances.length

  const isPending = isPendingTokenBalances || isPendingCoinPrices || isPendingConversionRate

  const indexedCoinBalances: IndexedData[] = coinBalances.map((balance, index) => {
    if (compareAddress(balance.contractAddress, ethers.ZeroAddress)) {
      const nativeTokenInfo = getNativeTokenInfoByChainId(balance.chainId, chains)

      return {
        index,
        name: nativeTokenInfo.name
      }
    } else {
      return {
        index,
        name: balance.contractInfo?.name || 'Unknown'
      }
    }
  })

  const indexedCollectionBalances: IndexedData[] = collectionBalances.map((balance, index) => ({
    index,
    name: balance.contractInfo?.name || 'Unknown'
  }))

  useEffect(() => {
    if (!initCoinsFlag && indexedCoinBalances.length > 0) {
      setDisplayedCoinBalances(indexedCoinBalances.slice(0, pageSize))
      sethasMoreCoins(indexedCoinBalances.length > pageSize)
      setInitCoinsFlag(true)
    }
  }, [initCoinsFlag])

  useEffect(() => {
    if (!initCollectionsFlag && indexedCollectionBalances.length > 0) {
      setDisplayedCollectionBalances(indexedCollectionBalances.slice(0, pageSize))
      sethasMoreCollections(indexedCollectionBalances.length > pageSize)
      setInitCollectionsFlag(true)
    }
  }, [initCollectionsFlag])

  useEffect(() => {
    if (search !== '') {
      setDisplayedSearchCoinBalances(
        fuzzySearchCoinBalances
          .search(search)
          .map(result => result.item)
          .slice(0, pageSize)
      )
      sethasMoreSearchCoins(fuzzySearchCoinBalances.search(search).length > pageSize)
    }
  }, [search])

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

  const fetchMoreCoinBalances = () => {
    if (displayedCoinBalances.length >= indexedCoinBalances.length) {
      sethasMoreCoins(false)
      return
    }
    setDisplayedCoinBalances(indexedCoinBalances.slice(0, displayedCoinBalances.length + pageSize))
  }

  const fetchMoreCollectionBalances = () => {
    if (displayedCollectionBalances.length >= indexedCollectionBalances.length) {
      sethasMoreCollections(false)
      return
    }
    setDisplayedCollectionBalances(indexedCollectionBalances.slice(0, displayedCollectionBalances.length + pageSize))
  }

  const fetchMoreSearchCoinBalances = () => {
    if (displayedSearchCoinBalances.length >= fuzzySearchCoinBalances.search(search).length) {
      sethasMoreSearchCoins(false)
      return
    }
    setDisplayedSearchCoinBalances(
      fuzzySearchCoinBalances
        .search(search)
        .map(result => result.item)
        .slice(0, displayedSearchCoinBalances.length + pageSize)
    )
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

  const fuzzySearchCoinBalances = new Fuse(indexedCoinBalances, {
    keys: ['name']
  })

  const fuzzySearchCollections = new Fuse(indexedCollectionBalances, {
    keys: ['name']
  })

  return (
    <Box paddingX="4" paddingBottom="5" paddingTop="3" flexDirection="column" gap="5" alignItems="center" justifyContent="center">
      <Box width="full">
        <TextInput
          autoFocus
          name="search wallet"
          leftIcon={SearchIcon}
          value={search}
          onChange={ev => setSearch(ev.target.value)}
          placeholder="Search your wallet"
          data-1p-ignore
        />
      </Box>

      <Box width="full">
        <TabsRoot value={selectedTab} onValueChange={value => setSelectedTab(value as 'coins' | 'collections')}>
          <Box marginBottom="5">
            {!isPending && (
              <TabsHeader
                value={selectedTab}
                tabs={[
                  { label: `Coins (${coinBalancesAmount})`, value: 'coins' },
                  { label: `Collections (${collectionBalancesAmount})`, value: 'collections' }
                ]}
              />
            )}
            {isPending && <Skeleton style={{ width: '360px', height: '48px' }} />}
          </Box>

          <TabsContent value="collections">
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
          </TabsContent>

          <TabsContent value="coins">
            <CoinsTab
              displayedCoinBalances={search ? displayedSearchCoinBalances : displayedCoinBalances}
              fetchMoreCoinBalances={fetchMoreCoinBalances}
              fetchMoreSearchCoinBalances={fetchMoreSearchCoinBalances}
              hasMoreCoins={hasMoreCoins}
              hasMoreSearchCoins={hasMoreSearchCoins}
              isSearching={search !== ''}
              isPending={isPending}
              coinBalances={coinBalances}
            />
          </TabsContent>
        </TabsRoot>
      </Box>
    </Box>
  )
}
