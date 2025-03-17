import { getNativeTokenInfoByChainId, ContractVerificationStatus, compareAddress } from '@0xsequence/connect'
import { SearchIcon, Skeleton, Text, TextInput } from '@0xsequence/design-system'
import { useGetTokenBalancesSummary, useGetCoinPrices, useGetExchangeRate } from '@0xsequence/react-hooks'
import Fuse from 'fuse.js'
import { useState } from 'react'
import { zeroAddress } from 'viem'
import { useAccount, useConfig } from 'wagmi'

import { useSettings } from '../../hooks'
import { computeBalanceFiat } from '../../utils'

import { BalanceItem } from './components/BalanceItem'
import { WalletLink } from './components/WalletLink'

export const SearchWallet = () => {
  const { chains } = useConfig()
  const { fiatCurrency, hideUnlistedTokens, selectedNetworks } = useSettings()
  const [search, setSearch] = useState('')
  const { address: accountAddress } = useAccount()

  const { data: tokenBalancesData, isPending: isPendingTokenBalances } = useGetTokenBalancesSummary({
    chainIds: selectedNetworks,
    filter: {
      accountAddresses: accountAddress ? [accountAddress] : [],
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      omitNativeBalances: false
    }
  })

  const coinBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC20' || compareAddress(b.contractAddress, zeroAddress)) || []

  const { data: coinPrices = [], isPending: isPendingCoinPrices } = useGetCoinPrices(
    coinBalancesUnordered.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  )

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useGetExchangeRate(fiatCurrency.symbol)

  const coinBalances = coinBalancesUnordered.sort((a, b) => {
    const isHigherFiat =
      Number(
        computeBalanceFiat({
          balance: b,
          prices: coinPrices,
          conversionRate,
          decimals: b.contractInfo?.decimals || 18
        })
      ) -
      Number(
        computeBalanceFiat({
          balance: a,
          prices: coinPrices,
          conversionRate,
          decimals: a.contractInfo?.decimals || 18
        })
      )
    return isHigherFiat
  })

  const collectionBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC721' || b.contractType === 'ERC1155') || []
  const collectionBalances = collectionBalancesUnordered.sort((a, b) => {
    return Number(b.balance) - Number(a.balance)
  })

  const isPending = isPendingTokenBalances || isPendingCoinPrices || isPendingConversionRate

  interface IndexedData {
    index: number
    name: string
  }
  const indexedCollectionBalances: IndexedData[] = collectionBalances.map((balance, index) => {
    return {
      index,
      name: balance.contractInfo?.name || 'Unknown'
    }
  })

  const indexedCoinBalances: IndexedData[] = coinBalances.map((balance, index) => {
    if (compareAddress(balance.contractAddress, zeroAddress)) {
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

  const coinBalancesAmount = coinBalances.length
  const collectionBalancesAmount = collectionBalances.length

  const fuzzySearchCoinBalances = new Fuse(indexedCoinBalances, {
    keys: ['name']
  })

  const fuzzySearchCollections = new Fuse(indexedCollectionBalances, {
    keys: ['name']
  })

  const foundCoinBalances = (
    search === '' ? indexedCoinBalances : fuzzySearchCoinBalances.search(search).map(result => result.item)
  ).slice(0, 5)
  const foundCollectionBalances = (
    search === '' ? indexedCollectionBalances : fuzzySearchCollections.search(search).map(result => result.item)
  ).slice(0, 5)

  return (
    <div className="flex px-4 pb-5 pt-3 flex-col gap-10 items-center justify-center">
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
      <div className="flex w-full flex-col items-center justify-center gap-5">
        <WalletLink
          toLocation={{
            location: 'search-view-all',
            params: {
              defaultTab: 'coins'
            }
          }}
          label={`Coins (${coinBalancesAmount})`}
        />
        {isPending ? (
          Array(5)
            .fill(null)
            .map((_, i) => <Skeleton className="w-full h-8" key={i} />)
        ) : foundCoinBalances.length === 0 ? (
          <Text color="primary">No coins found</Text>
        ) : (
          foundCoinBalances.map((indexItem, index) => {
            const balance = coinBalances[indexItem.index]
            return <BalanceItem key={index} balance={balance} />
          })
        )}
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-5">
        <WalletLink
          toLocation={{
            location: 'search-view-all',
            params: {
              defaultTab: 'collections'
            }
          }}
          label={`Collections (${collectionBalancesAmount})`}
        />
        {isPending ? (
          Array(5)
            .fill(null)
            .map((_, i) => <Skeleton className="w-full h-8" key={i} />)
        ) : foundCollectionBalances.length === 0 ? (
          <Text color="primary">No collections found</Text>
        ) : (
          foundCollectionBalances.map((indexedItem, index) => {
            const balance = collectionBalances[indexedItem.index]
            return <BalanceItem key={index} balance={balance} />
          })
        )}
      </div>
    </div>
  )
}
