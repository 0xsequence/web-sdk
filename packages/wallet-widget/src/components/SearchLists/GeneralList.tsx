import { compareAddress, getNativeTokenInfoByChainId, useWallets } from '@0xsequence/connect'
import { cn, Divider, SearchIcon, TabsContent, TabsHeader, TabsPrimitive, Text, TextInput } from '@0xsequence/design-system'
import { useGetCoinPrices, useGetExchangeRate, useGetTransactionHistorySummary } from '@0xsequence/hooks'
import type { ContractInfo, Transaction, TxnTransfer } from '@0xsequence/indexer'
import { ethers } from 'ethers'
import Fuse from 'fuse.js'
import { useObservable } from 'micro-observables'
import { useEffect, useMemo } from 'react'
import { useConfig } from 'wagmi'

import { useGetAllTokensDetails, useGetMoreBalances, useNavigation, useSettings, useSwap } from '../../hooks/index.js'
import { useGetAllCollections } from '../../hooks/useGetAllCollections.js'
import { useNavigationHeader } from '../../hooks/useNavigationHeader.js'
import { computeBalanceFiat, type TokenBalanceWithDetails } from '../../utils/index.js'
import { FilterMenu } from '../Filter/FilterMenu.js'
import { TransactionHistoryList } from '../TransactionHistoryList/index.js'

import { CollectiblesTab } from './CollectiblesList/CollectiblesTab.js'
import { CollectionsTab } from './CollectionsList/CollectionsTab.js'
import { CoinsTab } from './TokenList/CoinsTab.js'

const TOKEN_PAGE_SIZE = 10
const COLLECTIBLE_PAGE_SIZE = 9
const COLLECTION_PAGE_SIZE = 9

export const GeneralList = ({ variant = 'default' }: { variant?: 'default' | 'send' | 'swap' }) => {
  const { setNavigation } = useNavigation()
  const { chains } = useConfig()
  const {
    fiatCurrency,
    allNetworks,
    hideUnlistedTokens,
    selectedNetworksObservable,
    selectedWalletsObservable,
    showCollectionsObservable
  } = useSettings()
  const { wallets, setActiveWallet } = useWallets()
  const { search, selectedTab, setSearch, setSelectedTab } = useNavigationHeader()
  const { lifiTokens } = useSwap()

  const selectedNetworks = useObservable(selectedNetworksObservable)
  const selectedWallets = useObservable(selectedWalletsObservable)
  const showCollections = useObservable(showCollectionsObservable)

  useEffect(() => {
    if (variant === 'send' || variant === 'swap') {
      setSelectedTab('tokens')
    }
    return () => {
      setSearch('')
    }
  }, [variant])

  const activeWallet = wallets.find(wallet => wallet.isActive)

  const { data: tokenBalancesData = [], isLoading: isLoadingTokenBalances } = useGetAllTokensDetails({
    accountAddresses:
      variant === 'default' || variant === 'swap' ? selectedWallets.map(wallet => wallet.address) : [activeWallet?.address || ''],
    chainIds: variant === 'default' || variant === 'swap' ? selectedNetworks : allNetworks,
    hideUnlistedTokens
  })

  const { data: collectionsData = [] } = useGetAllCollections({
    accountAddresses: variant === 'default' ? selectedWallets.map(wallet => wallet.address) : [activeWallet?.address || ''],
    chainIds: variant === 'default' ? selectedNetworks : allNetworks,
    hideUnlistedTokens
  })

  const collectionsDataWithDetails = collectionsData.map(collection => ({
    ...collection,
    _type: 'collection' as const
  }))

  const tokenBalancesWithLifiSupport = tokenBalancesData?.filter(b =>
    lifiTokens.some(token => token.chainId === b.chainId && token.contractAddress === b.contractAddress)
  )

  const coinBalancesUnordered =
    (variant === 'swap' ? tokenBalancesWithLifiSupport : tokenBalancesData)?.filter(
      b => b.contractType === 'ERC20' || compareAddress(b.contractAddress, ethers.ZeroAddress)
    ) || []

  const { data: coinPrices = [], isLoading: isLoadingCoinPrices } = useGetCoinPrices(
    coinBalancesUnordered.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  )

  const { data: conversionRate = 1, isLoading: isLoadingConversionRate } = useGetExchangeRate(fiatCurrency.symbol)

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

  const coinBalancesWithPrice = coinBalances.map(balance => {
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
      price: { value: priceValue, currency: priceCurrency },
      _type: 'coin' as const
    }
  })

  const isLoading = isLoadingTokenBalances || isLoadingCoinPrices || isLoadingConversionRate

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
    },
    _type: 'collectible' as const
  }))

  const fuseOptions = {
    threshold: 0.1,
    ignoreLocation: true,
    keys: [
      // Coin: Name
      {
        name: 'coinName',
        getFn: (item: any) => {
          if (item._type === 'coin') {
            if (compareAddress(item.contractAddress, ethers.ZeroAddress)) {
              const nativeTokenInfo = getNativeTokenInfoByChainId(item.chainId, chains)
              return nativeTokenInfo.name
            }
            return item.contractInfo?.name || 'Unknown'
          }
        }
      },
      // Collectible: Name
      {
        name: 'collectibleName',
        getFn: (item: any) => {
          if (item._type === 'collectible') {
            return item.tokenMetadata?.name || ''
          }
        }
      },
      // Collectible: Collection Name
      {
        name: 'collectionName',
        getFn: (item: any) => {
          if (item._type === 'collectible') {
            return item.contractInfo?.name || ''
          }
          return ''
        }
      },
      // Collection: Name
      {
        name: 'collectionName',
        getFn: (item: any) => {
          if (item._type === 'collection') {
            return item.contractInfo?.name || ''
          }
          return ''
        }
      },
      // Transaction: Contract Name
      {
        name: 'contractName',
        getFn: (item: any) => {
          if (item._type === 'transaction') {
            return item.transfers?.map((transfer: TxnTransfer) => transfer.contractInfo?.name).join(', ') || ''
          }
          return ''
        }
      },
      // Transaction: Token Symbol
      {
        name: 'tokenSymbol',
        getFn: (item: any) => {
          if (item._type === 'transaction') {
            const hasNativeToken = item.transfers?.some((transfer: TxnTransfer) =>
              compareAddress(transfer.contractInfo?.address || '', ethers.ZeroAddress)
            )
            if (hasNativeToken) {
              const nativeTokenInfo = getNativeTokenInfoByChainId(item.chainId, chains)
              return nativeTokenInfo.symbol
            }
            return item.transfers?.map((transfer: TxnTransfer) => transfer.contractInfo?.symbol).join(', ') || ''
          }
          return ''
        }
      },
      // Transaction: Collectible Name
      {
        name: 'collectibleName',
        getFn: (item: any) => {
          if (item._type === 'transaction') {
            return (
              item.transfers
                ?.map((transfer: TxnTransfer) => {
                  return Object.values(transfer.tokenMetadata || {})
                    .map(tokenMetadata => tokenMetadata?.name)
                    .join(', ')
                })
                .join(', ') || ''
            )
          }
          return ''
        }
      },
      // Transaction: Date
      {
        name: 'date',
        getFn: (item: any) => {
          if (item._type === 'transaction') {
            const date = new Date(item.timestamp)
            const day = date.getDate()
            const month = date.toLocaleString('en-US', { month: 'long' })
            const year = date.getFullYear()
            return `
              ${day} ${month} ${year}
              ${day} ${year} ${month}
              ${month} ${day} ${year}
              ${month} ${year} ${day}
              ${year} ${day} ${month}
              ${year} ${month} ${day}
            `
          }
          return ''
        }
      }
    ]
  }

  const { data: transactionHistoryData = [], isLoading: isLoadingTransactionHistory } = useGetTransactionHistorySummary({
    accountAddresses: selectedWallets.map(wallet => wallet.address),
    chainIds: selectedNetworks
  })

  const transactionHistory = transactionHistoryData.map(transaction => ({
    ...transaction,
    _type: 'transaction' as const
  }))

  // combinedBalances is used for search
  const combinedBalances = [
    ...coinBalancesWithPrice,
    ...collectibleBalancesWithPrice,
    ...collectionsDataWithDetails,
    ...transactionHistory
  ]

  const fuse = useMemo(() => {
    return new Fuse(combinedBalances, fuseOptions)
  }, [combinedBalances])

  const searchResults = useMemo(() => {
    if (!search.trimStart()) {
      return []
    }
    return fuse.search(search).map(result => result.item)
  }, [search, fuse])

  // infinite scroll for tokens
  const {
    data: infiniteBalancesTokens,
    fetchNextPage: fetchMoreBalancesTokens,
    hasNextPage: hasMoreBalancesTokens,
    isFetching: isFetchingMoreBalancesTokens
  } = useGetMoreBalances(coinBalancesWithPrice, TOKEN_PAGE_SIZE, { enabled: search.trim() === '' })

  const {
    data: infiniteSearchBalancesTokens,
    fetchNextPage: fetchMoreSearchBalancesTokens,
    hasNextPage: hasMoreSearchBalancesTokens,
    isFetching: isFetchingMoreSearchBalancesTokens
  } = useGetMoreBalances(searchResults.filter(item => item._type === 'coin') as TokenBalanceWithDetails[], TOKEN_PAGE_SIZE, {
    enabled: search.trim() !== ''
  })

  // infinite scroll for collectibles

  const {
    data: infiniteBalancesCollectibles,
    fetchNextPage: fetchMoreBalancesCollectibles,
    hasNextPage: hasMoreBalancesCollectibles,
    isFetching: isFetchingMoreBalancesCollectibles
  } = useGetMoreBalances(collectibleBalancesWithPrice, COLLECTIBLE_PAGE_SIZE, { enabled: search.trim() === '' })

  const {
    data: infiniteSearchBalancesCollectibles,
    fetchNextPage: fetchMoreSearchBalancesCollectibles,
    hasNextPage: hasMoreSearchBalancesCollectibles,
    isFetching: isFetchingMoreSearchBalancesCollectibles
  } = useGetMoreBalances(
    searchResults.filter(item => item._type === 'collectible') as TokenBalanceWithDetails[],
    COLLECTIBLE_PAGE_SIZE,
    {
      enabled: search.trim() !== ''
    }
  )

  // infinite scroll for collections

  const {
    data: infiniteBalancesCollections,
    fetchNextPage: fetchMoreBalancesCollections,
    hasNextPage: hasMoreBalancesCollections,
    isFetching: isFetchingMoreBalancesCollections
  } = useGetMoreBalances(collectionsDataWithDetails, COLLECTION_PAGE_SIZE, { enabled: search.trim() === '' })

  const {
    data: infiniteSearchBalancesCollections,
    fetchNextPage: fetchMoreSearchBalancesCollections,
    hasNextPage: hasMoreSearchBalancesCollections,
    isFetching: isFetchingMoreSearchBalancesCollections
  } = useGetMoreBalances(
    searchResults.filter(item => item._type === 'collection'),
    COLLECTION_PAGE_SIZE,
    {
      enabled: search.trim() !== ''
    }
  )

  const handleTokenClickDefault = (balance: TokenBalanceWithDetails) => {
    setNavigation({
      location: 'coin-details',
      params: {
        contractAddress: balance.contractAddress,
        chainId: balance.chainId,
        accountAddress: balance.accountAddress
      }
    })
  }

  const handleTokenClickSend = (token: TokenBalanceWithDetails) => {
    setNavigation({
      location: 'send-coin',
      params: {
        chainId: token.chainId,
        contractAddress: token.contractAddress
      }
    })
  }

  const handleTokenClickSwap = async (token: TokenBalanceWithDetails) => {
    await setActiveWallet(token.accountAddress)
    setNavigation({
      location: 'swap-coin',
      params: {
        chainId: token.chainId,
        contractAddress: token.contractAddress
      }
    })
  }

  const handleCollectibleClickDefault = (balance: TokenBalanceWithDetails) => {
    setNavigation({
      location: 'collectible-details',
      params: {
        contractAddress: balance.contractAddress,
        chainId: balance.chainId,
        tokenId: balance.tokenID || '',
        accountAddress: balance.accountAddress
      }
    })
  }

  const handleCollectibleClickSend = (token: TokenBalanceWithDetails) => {
    setNavigation({
      location: 'send-collectible',
      params: {
        chainId: token.chainId,
        contractAddress: token.contractAddress,
        tokenId: token.tokenID || ''
      }
    })
  }

  const handleCollectionClick = (collection: ContractInfo) => {
    setNavigation({
      location: 'collection-details',
      params: {
        contractAddress: collection.address,
        chainId: collection.chainId
      }
    })
  }

  return (
    <div className="w-full">
      <TabsPrimitive.Root
        className="w-full"
        value={selectedTab}
        onValueChange={value => setSelectedTab(value as 'tokens' | 'collectibles' | 'history')}
      >
        <div className="sticky top-0 z-20 bg-background-primary shadow-sm gap-4">
          {variant === 'default' ? (
            <div className="flex flex-col w-full relative">
              <TabsPrimitive.TabsList className="px-4">
                <TabsPrimitive.TabsTrigger className="h-10 relative cursor-pointer" value="tokens">
                  <Text className="px-4" variant="medium" color={selectedTab === 'tokens' ? 'primary' : 'muted'}>
                    Coins
                  </Text>
                  {selectedTab === 'tokens' && <div className="absolute bottom-0 w-full h-[2px] bg-white" />}
                </TabsPrimitive.TabsTrigger>
                <TabsPrimitive.TabsTrigger className="h-10 relative cursor-pointer" value="collectibles">
                  <Text className="px-4" variant="medium" color={selectedTab === 'collectibles' ? 'primary' : 'muted'}>
                    Collectibles
                  </Text>
                  {selectedTab === 'collectibles' && <div className="absolute bottom-0 w-full h-[2px] bg-white" />}
                </TabsPrimitive.TabsTrigger>
                <TabsPrimitive.TabsTrigger className="h-10 relative cursor-pointer" value="history">
                  <Text className="px-4" variant="medium" color={selectedTab === 'history' ? 'primary' : 'muted'}>
                    Transactions
                  </Text>
                  {selectedTab === 'history' && <div className="absolute bottom-0 w-full h-[2px] bg-white" />}
                </TabsPrimitive.TabsTrigger>
              </TabsPrimitive.TabsList>
              <Divider className="absolute bottom-0 my-0 w-full" />
            </div>
          ) : (
            <div className={cn('flex flex-col px-4 gap-4', `${variant === 'send' && 'pt-4'}`)}>
              {variant === 'send' && (
                <TabsHeader
                  tabs={[
                    { label: 'Coins', value: 'tokens' },
                    { label: 'Collectibles', value: 'collectibles' }
                  ]}
                  value={selectedTab}
                />
              )}

              <div>
                <TextInput
                  name="search"
                  leftIcon={SearchIcon}
                  value={search}
                  onChange={ev => setSearch(ev.target.value)}
                  placeholder="Search your wallet"
                />
              </div>
            </div>
          )}
          <div className="flex flex-col p-4">
            {(variant === 'default' || variant === 'swap') && <FilterMenu filterMenuType={selectedTab} />}
          </div>
        </div>

        <div className="flex flex-col p-4 pt-0">
          <TabsContent value="tokens">
            <div>
              <CoinsTab
                displayedCoinBalances={search ? infiniteSearchBalancesTokens?.pages.flat() : infiniteBalancesTokens?.pages.flat()}
                fetchMoreCoinBalances={search ? fetchMoreSearchBalancesTokens : fetchMoreBalancesTokens}
                hasMoreCoinBalances={search ? hasMoreSearchBalancesTokens : hasMoreBalancesTokens}
                isFetchingMoreCoinBalances={search ? isFetchingMoreSearchBalancesTokens : isFetchingMoreBalancesTokens}
                isFetchingInitialBalances={isLoading}
                onTokenClick={
                  variant === 'default'
                    ? handleTokenClickDefault
                    : variant === 'send'
                      ? handleTokenClickSend
                      : handleTokenClickSwap
                }
                includeUserAddress={variant === 'default' || variant === 'swap'}
              />
            </div>
          </TabsContent>
          <TabsContent value="collectibles">
            <div>
              {showCollections ? (
                <CollectionsTab
                  displayedCollectibleBalances={
                    search ? infiniteSearchBalancesCollections?.pages.flat() : infiniteBalancesCollections?.pages.flat()
                  }
                  fetchMoreCollectibleBalances={search ? fetchMoreSearchBalancesCollections : fetchMoreBalancesCollections}
                  hasMoreCollectibleBalances={search ? hasMoreSearchBalancesCollections : hasMoreBalancesCollections}
                  isFetchingMoreCollectibleBalances={
                    search ? isFetchingMoreSearchBalancesCollections : isFetchingMoreBalancesCollections
                  }
                  isFetchingInitialBalances={isLoading}
                  onTokenClick={handleCollectionClick}
                />
              ) : (
                <CollectiblesTab
                  displayedCollectibleBalances={
                    search ? infiniteSearchBalancesCollectibles?.pages.flat() : infiniteBalancesCollectibles?.pages.flat()
                  }
                  fetchMoreCollectibleBalances={search ? fetchMoreSearchBalancesCollectibles : fetchMoreBalancesCollectibles}
                  hasMoreCollectibleBalances={search ? hasMoreSearchBalancesCollectibles : hasMoreBalancesCollectibles}
                  isFetchingMoreCollectibleBalances={
                    search ? isFetchingMoreSearchBalancesCollectibles : isFetchingMoreBalancesCollectibles
                  }
                  isFetchingInitialBalances={isLoading}
                  onTokenClick={variant === 'default' ? handleCollectibleClickDefault : handleCollectibleClickSend}
                />
              )}
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div>
              <TransactionHistoryList
                transactions={
                  search
                    ? (searchResults.filter(item => item._type === 'transaction') as unknown as Transaction[])
                    : transactionHistory
                }
                isLoading={isLoadingTransactionHistory}
                isFetchingNextPage={false}
              />
            </div>
          </TabsContent>
        </div>
      </TabsPrimitive.Root>
    </div>
  )
}
