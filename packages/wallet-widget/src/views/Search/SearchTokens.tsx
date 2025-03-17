import { ContractVerificationStatus, compareAddress, getNativeTokenInfoByChainId } from '@0xsequence/connect'
import { cardVariants, cn, GearIcon, SearchIcon, TextInput } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import { useGetTokenBalancesSummary, useGetCoinPrices, useGetExchangeRate } from '@0xsequence/react-hooks'
import { ethers } from 'ethers'
import Fuse from 'fuse.js'
import { AnimatePresence } from 'motion/react'
import { useState, useMemo } from 'react'
import { useConfig } from 'wagmi'

import { useSettings } from '../../hooks'
import { computeBalanceFiat } from '../../utils'
import { getMoreBalances } from '../../utils'
import { FilterMenu } from '../FilterMenu'

import { CoinsTab } from './components/CoinsTab'

export const SearchTokens = () => {
  const pageSize = 15

  const { chains } = useConfig()
  const { selectedWallets, selectedNetworks, fiatCurrency, hideUnlistedTokens, selectedCollections } = useSettings()

  const [search, setSearch] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { data: tokenBalancesData, isPending: isPendingTokenBalances } = useGetTokenBalancesSummary({
    chainIds: selectedNetworks,
    filter: {
      accountAddresses: selectedWallets.map(wallet => wallet.address),
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      contractWhitelist: selectedCollections.map(collection => collection.contractAddress),
      omitNativeBalances: false
    }
  })

  const coinBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC20' || compareAddress(b.contractAddress, ethers.ZeroAddress)) || []

  const { data: coinPrices = [], isPending: isPendingCoinPrices } = useGetCoinPrices(
    coinBalancesUnordered.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  )

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useGetExchangeRate(fiatCurrency.symbol)

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

  const isPending = isPendingTokenBalances || isPendingCoinPrices || isPendingConversionRate

  const fuseOptions = {
    keys: [
      {
        name: 'name',
        getFn: (token: TokenBalance) => {
          if (compareAddress(token.contractAddress, ethers.ZeroAddress)) {
            const nativeTokenInfo = getNativeTokenInfoByChainId(token.chainId, chains)
            return nativeTokenInfo.name
          }
          return token.contractInfo?.name || 'Unknown'
        }
      }
    ],
    ignoreLocation: true
  }

  const fuse = useMemo(() => {
    return new Fuse(coinBalances, fuseOptions)
  }, [coinBalances])

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
  } = getMoreBalances(coinBalances, pageSize, { enabled: search.trim() === '' })

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
        <CoinsTab
          displayedCoinBalances={search ? infiniteSearchBalances?.pages.flat() : infiniteBalances?.pages.flat()}
          fetchMoreCoinBalances={search ? fetchMoreSearchBalances : fetchMoreBalances}
          hasMoreCoinBalances={search ? hasMoreSearchBalances : hasMoreBalances}
          isFetchingMoreCoinBalances={search ? isFetchingMoreSearchBalances : isFetchingMoreBalances}
          isFetchingInitialBalances={isPending}
        />
      </div>
      <AnimatePresence>
        {isFilterOpen && (
          <FilterMenu
            onClose={() => setIsFilterOpen(false)}
            label="Token Filters"
            buttonLabel="Show Tokens"
            type="tokens"
            handleButtonPress={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
