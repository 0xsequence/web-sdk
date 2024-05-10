import { Box, SearchIcon, Skeleton, Text, TextInput } from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId, useExchangeRate, useCoinPrices, useBalances } from '@0xsequence/kit'
import { ethers } from 'ethers'
import Fuse from 'fuse.js'
import React, { useState } from 'react'
import { useAccount, useConfig } from 'wagmi'

import { useSettings } from '../../hooks'
import { compareAddress, computeBalanceFiat } from '../../utils'

import { BalanceItem } from './components/BalanceItem'
import { WalletLink } from './components/WalletLink'

export const SearchWallet = () => {
  const { chains } = useConfig()
  const { fiatCurrency, hideUnlistedTokens, selectedNetworks } = useSettings()
  const [search, setSearch] = useState('')
  const { address: accountAddress } = useAccount()

  const { data: tokenBalancesData, isPending: isPendingTokenBalances } = useBalances({
    chainIds: selectedNetworks,
    accountAddress: accountAddress || '',
    verifiedOnly: hideUnlistedTokens
  })

  const coinBalancesUnordered =
    tokenBalancesData?.filter(
      b => b.contractType === 'ERC20' || compareAddress(b.contractAddress, ethers.constants.AddressZero)
    ) || []

  const { data: coinPrices = [], isPending: isPendingCoinPrices } = useCoinPrices(
    coinBalancesUnordered.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  )

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useExchangeRate(fiatCurrency.symbol)

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
          decimals: b.contractInfo?.decimals || 18
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
    if (compareAddress(balance.contractAddress, ethers.constants.AddressZero)) {
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
    <Box
      paddingX="4"
      paddingBottom="5"
      paddingTop="3"
      flexDirection="column"
      gap="10"
      alignItems="center"
      justifyContent="center"
    >
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
      <Box width="full" flexDirection="column" alignItems="center" justifyContent="center" gap="5">
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
            .map((_, i) => <Skeleton key={i} width="full" height="8" />)
        ) : foundCollectionBalances.length === 0 ? (
          <Text color="text100">No collections found</Text>
        ) : (
          foundCollectionBalances.map((indexedItem, index) => {
            const balance = collectionBalances[indexedItem.index]
            return <BalanceItem key={index} balance={balance} />
          })
        )}
      </Box>
      <Box width="full" flexDirection="column" alignItems="center" justifyContent="center" gap="5">
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
            .map((_, i) => <Skeleton key={i} width="full" height="8" />)
        ) : foundCoinBalances.length === 0 ? (
          <Text color="text100">No coins found</Text>
        ) : (
          foundCoinBalances.map((indexItem, index) => {
            const balance = coinBalances[indexItem.index]
            return <BalanceItem key={index} balance={balance} />
          })
        )}
      </Box>
    </Box>
  )
}
