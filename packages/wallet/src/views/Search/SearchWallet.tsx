import React, { useState } from 'react'
import { ethers } from 'ethers'
import { Box, SearchIcon, Text, TextInput, vars } from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId } from '@0xsequence/kit'
import Fuse from 'fuse.js'
import { useAccount, useConfig } from 'wagmi'

import { BalanceItem } from './components/BalanceItem'
import { WalletLink } from './components/WalletLink'

import { Skeleton } from '../../shared/Skeleton'
import { SCROLLBAR_WIDTH } from '../../constants'
import { useBalances, useCoinPrices, useConversionRate, useSettings } from '../../hooks'
import { compareAddress, computeBalanceFiat } from '../../utils'

export const SearchWallet = () => {
  const { chains } = useConfig()
  const { fiatCurrency, hideUnlistedTokens, selectedNetworks } = useSettings()
  const [search, setSearch] = useState('')
  const { address: accountAddress } = useAccount()

  const { data: tokenBalancesData, isLoading: tokenBalancesIsLoading } = useBalances(
    {
      accountAddress: accountAddress || '',
      chainIds: selectedNetworks
    },
    { hideUnlistedTokens }
  )

  const coinBalancesUnordered =
    tokenBalancesData?.filter(
      b => b.contractType === 'ERC20' || compareAddress(b.contractAddress, ethers.constants.AddressZero)
    ) || []

  const { data: coinPrices = [], isLoading: isLoadingCoinPrices } = useCoinPrices({
    tokens: coinBalancesUnordered.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  })

  const { data: conversionRate = 1, isLoading: isLoadingConversionRate } = useConversionRate({
    toCurrency: fiatCurrency.symbol
  })

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

  const isLoading = tokenBalancesIsLoading || isLoadingCoinPrices || isLoadingConversionRate

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
      paddingLeft="5"
      paddingBottom="5"
      paddingTop="3"
      flexDirection="column"
      gap="10"
      alignItems="center"
      justifyContent="center"
      style={{ paddingRight: `calc(${vars.space[5]} - ${SCROLLBAR_WIDTH})` }}
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
        {isLoading ? (
          Array(5)
            .fill(null)
            .map((_, i) => <Skeleton key={i} width="100%" height="32px" />)
        ) : foundCollectionBalances.length === 0 ? (
          <Text color="text100">No collections found</Text>
        ) : (
          foundCollectionBalances.map(indexedItem => {
            const balance = collectionBalances[indexedItem.index]
            return <BalanceItem key={balance.contractAddress} balance={balance} />
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
        {isLoading ? (
          Array(5)
            .fill(null)
            .map((_, i) => <Skeleton key={i} width="100%" height="32px" />)
        ) : foundCoinBalances.length === 0 ? (
          <Text color="text100">No coins found</Text>
        ) : (
          foundCoinBalances.map(indexItem => {
            const balance = coinBalances[indexItem.index]
            return <BalanceItem key={balance.contractAddress} balance={balance} />
          })
        )}
      </Box>
    </Box>
  )
}
