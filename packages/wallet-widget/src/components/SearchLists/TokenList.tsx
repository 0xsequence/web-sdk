import { compareAddress, getNativeTokenInfoByChainId } from '@0xsequence/connect'
import { SearchIcon, TextInput } from '@0xsequence/design-system'
import { useGetCoinPrices, useGetExchangeRate } from '@0xsequence/hooks'
import { TokenBalance } from '@0xsequence/indexer'
import { ethers } from 'ethers'
import Fuse from 'fuse.js'
import { useState, useMemo } from 'react'
import { useConfig } from 'wagmi'

import { useSettings } from '../../hooks'
import { computeBalanceFiat, TokenBalanceWithPrice } from '../../utils'
import { useGetMoreBalances } from '../../utils'
import { FilterButton } from '../Filter/FilterButton'

import { CoinsTab } from './TokenList/CoinsTab'

export const TokenList = ({
  tokenBalancesData,
  isPendingTokenBalances,
  onTokenClick,
  includeUserAddress = false,
  enableFilters = true
}: {
  tokenBalancesData: TokenBalance[]
  isPendingTokenBalances: boolean
  onTokenClick: (token: TokenBalanceWithPrice) => void
  enableFilters?: boolean
  includeUserAddress?: boolean
}) => {
  const pageSize = 10

  const { chains } = useConfig()
  const { fiatCurrency } = useSettings()

  const [search, setSearch] = useState('')

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

  const coinBalancesWithPrices = coinBalances.map(balance => {
    const matchingPrice = coinPrices.find(price => {
      const isSameChainAndAddress =
        price.token.chainId === balance.chainId && price.token.contractAddress === balance.contractAddress

      const isTokenIdMatch =
        price.token.tokenId === balance.tokenID || !(balance.contractType === 'ERC721' || balance.contractType === 'ERC1155')

      return isSameChainAndAddress && isTokenIdMatch
    })

    const priceValue = (matchingPrice?.price?.value || 0) * conversionRate
    const priceCurrency = fiatCurrency.symbol

    return {
      ...balance,
      price: { value: priceValue, currency: priceCurrency }
    }
  })

  const isPending = isPendingTokenBalances || isPendingCoinPrices || isPendingConversionRate

  const fuseOptions = {
    threshold: 0.1,
    ignoreLocation: true,
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
    ]
  }

  const fuse = useMemo(() => {
    return new Fuse(coinBalancesWithPrices, fuseOptions)
  }, [coinBalancesWithPrices])

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
  } = useGetMoreBalances(coinBalancesWithPrices, pageSize, { enabled: search.trim() === '' })

  const {
    data: infiniteSearchBalances,
    fetchNextPage: fetchMoreSearchBalances,
    hasNextPage: hasMoreSearchBalances,
    isFetching: isFetchingMoreSearchBalances
  } = useGetMoreBalances(searchResults, pageSize, { enabled: search.trim() !== '' })

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
        {enableFilters && <FilterButton label="Token Filters" type="tokens" />}
      </div>
      <div className="w-full">
        <CoinsTab
          displayedCoinBalances={search ? infiniteSearchBalances?.pages.flat() : infiniteBalances?.pages.flat()}
          fetchMoreCoinBalances={search ? fetchMoreSearchBalances : fetchMoreBalances}
          hasMoreCoinBalances={search ? hasMoreSearchBalances : hasMoreBalances}
          isFetchingMoreCoinBalances={search ? isFetchingMoreSearchBalances : isFetchingMoreBalances}
          isFetchingInitialBalances={isPending}
          onTokenClick={onTokenClick}
          includeUserAddress={includeUserAddress}
        />
      </div>
    </div>
  )
}
