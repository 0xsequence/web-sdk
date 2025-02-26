'use client'

import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { zeroAddress } from 'viem'

import { NATIVE_TOKEN_ADDRESS_0X, QUERY_KEYS } from '../constants'
import { compareAddress } from '../utils/helpers'
import { createNativeTokenBalance } from '../utils/tokens'
import { useAPIClient } from './useAPIClient'
import { useIndexerClient, useIndexerClients } from './useIndexerClient'
import { useMetadataClient } from './useMetadataClient'

import { GetLinkedWalletsArgs, GetSwapQuoteArgs, LinkedWallet, SequenceAPIClient, SwapPrice, Token } from '@0xsequence/api'
import {
  ContractVerificationStatus,
  GetTokenBalancesByContractArgs,
  GetTokenBalancesDetailsArgs,
  GetTokenBalancesSummaryArgs,
  Page,
  SequenceIndexer
} from '@0xsequence/indexer'
import { ContractInfo, SequenceMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork } from '@0xsequence/network'

interface UseLinkedWalletsOptions {
  enabled?: boolean
}

// Create a stable storage key from args
const createStorageKey = (args: GetLinkedWalletsArgs): string =>
  `@0xsequence.linked_wallets-${args.parentWalletAddress}-${args.signatureChainId}`

const getLinkedWallets = async (
  apiClient: SequenceAPIClient,
  args: GetLinkedWalletsArgs,
  headers?: object,
  signal?: AbortSignal
): Promise<Array<LinkedWallet>> => {
  const storageKey = createStorageKey(args)
  const now = Date.now()

  // Check localStorage for cached data
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    try {
      const { data, timestamp } = JSON.parse(stored)
      // Check if cache is still valid (5 minutes)
      if (now - timestamp <= 5 * 60 * 1000) {
        return data
      }
    } catch (error) {
      console.error('Error parsing stored linked wallets:', error)
    }
  }

  // If no valid cache, fetch new data
  const result = await apiClient.getLinkedWallets(args, headers, signal)
  const linkedWallets = result.linkedWallets

  // Store in localStorage with timestamp
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      data: linkedWallets,
      timestamp: now
    })
  )

  return linkedWallets
}

export interface UseLinkedWalletsResult {
  data: LinkedWallet[] | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  clearCache: () => void
}

export const useLinkedWallets = (args: GetLinkedWalletsArgs, options: UseLinkedWalletsOptions = {}): UseLinkedWalletsResult => {
  const apiClient = useAPIClient()
  const [data, setData] = useState<LinkedWallet[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController>()

  const fetchData = useCallback(async () => {
    if (!options.enabled) return

    setIsLoading(true)
    setError(null)

    try {
      // Cancel any ongoing request
      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()

      const linkedWallets = await getLinkedWallets(apiClient, args, undefined, abortControllerRef.current.signal)

      setData(linkedWallets)
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setError(error)
      } else if (error && typeof error === 'object' && 'name' in error && error.name !== 'AbortError') {
        setError(new Error('Failed to fetch linked wallets'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [apiClient, args.parentWalletAddress, args.signatureChainId, options.enabled])

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchData()
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [fetchData])

  const clearCache = useCallback(() => {
    localStorage.removeItem(createStorageKey(args))
  }, [args])

  const refetch = async () => {
    clearCache()
    await fetchData()
  }

  return {
    data,
    isLoading,
    error,
    refetch,
    clearCache
  }
}

export const time = {
  oneSecond: 1 * 1000,
  oneMinute: 60 * 1000,
  oneHour: 60 * 60 * 1000
}

/** @deprecated Use kit-hooks instead */
export const useClearCachedBalances = () => {
  const queryClient = useQueryClient()

  return {
    clearCachedBalances: () => {
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.balances,
          QUERY_KEYS.balancesSummary,
          QUERY_KEYS.coinBalance,
          QUERY_KEYS.coinBalanceSummary,
          QUERY_KEYS.collectibleBalance,
          QUERY_KEYS.collectibleBalanceDetails,
          QUERY_KEYS.collectionBalance,
          QUERY_KEYS.collectionBalanceDetails,
          QUERY_KEYS.transactionHistory
        ]
      })
    }
  }
}

export const getNativeTokenBalance = async (indexerClient: SequenceIndexer, chainId: number, accountAddress: string) => {
  const res = await indexerClient.getNativeTokenBalance({ accountAddress })

  return createNativeTokenBalance(chainId, accountAddress, res?.balance.balance || '0')
}

interface GetTokenBalancesArgs {
  accountAddress: string
  hideCollectibles?: boolean
  includeMetadata?: boolean
  verifiedOnly?: boolean
  contractAddress?: string
}

export const getTokenBalances = async (indexerClient: SequenceIndexer, args: GetTokenBalancesArgs) => {
  const res = await indexerClient.getTokenBalances({
    accountAddress: args.accountAddress,
    includeMetadata: args.includeMetadata ?? true,
    metadataOptions: {
      verifiedOnly: args.verifiedOnly ?? true
    },
    ...(args.contractAddress && { contractAddress: args.contractAddress })
  })

  return res?.balances || []
}

/** @deprecated Use kit-hooks instead */
export const getTokenBalancesSummary = async (indexerClient: SequenceIndexer, args: GetTokenBalancesSummaryArgs) => {
  const res = await indexerClient.getTokenBalancesSummary(args)
  return res?.balances || []
}

/** @deprecated Use kit-hooks instead */
export const getTokenBalancesDetails = async (indexerClient: SequenceIndexer, args: GetTokenBalancesDetailsArgs) => {
  const res = await indexerClient.getTokenBalancesDetails(args)
  return res?.balances || []
}

/** @deprecated Use kit-hooks instead */
export const getTokenBalancesByContract = async (indexerClient: SequenceIndexer, args: GetTokenBalancesByContractArgs) => {
  const res = await indexerClient.getTokenBalancesByContract(args)
  return res?.balances || []
}

/** @deprecated Use useBalancesSummary instead */
export const getBalances = async (indexerClient: SequenceIndexer, chainId: number, args: GetTokenBalancesArgs) => {
  if (!args.accountAddress) {
    return []
  }

  const balances = (
    await Promise.allSettled([
      getNativeTokenBalance(indexerClient, chainId, args.accountAddress),
      getTokenBalances(indexerClient, args)
    ])
  )
    .map(res => (res.status === 'fulfilled' ? res.value : []))
    .flat()

  return balances
}

/** @deprecated Use kit-hooks instead */
export const getBalancesSummary = async (indexerClient: SequenceIndexer, chainId: number, args: GetTokenBalancesSummaryArgs) => {
  if (!args.filter.accountAddresses[0]) {
    return []
  }

  const balances = (
    await Promise.allSettled([
      getNativeTokenBalance(indexerClient, chainId, args.filter.accountAddresses[0]),
      getTokenBalancesSummary(indexerClient, args)
    ])
  )
    .map(res => (res.status === 'fulfilled' ? res.value : []))
    .flat()

  return balances
}

/** @deprecated Use useBalancesSummaryArgs instead */
interface UseBalancesArgs extends GetTokenBalancesArgs {
  chainIds: number[]
}

/** @deprecated Use useBalancesSummary instead */
// Gets native and token balances
export const useBalances = ({ chainIds, ...args }: UseBalancesArgs) => {
  const indexerClients = useIndexerClients(chainIds)

  return useQuery({
    queryKey: [QUERY_KEYS.balances, chainIds, args],
    queryFn: async () => {
      const res = (
        await Promise.all(
          Array.from(indexerClients.entries()).map(([chainId, indexerClient]) => getBalances(indexerClient, chainId, args))
        )
      ).flat()

      return res
    },
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: chainIds.length > 0 && !!args.accountAddress
  })
}

interface UseBalancesSummaryArgs extends GetTokenBalancesSummaryArgs {
  chainIds: number[]
}

/** @deprecated Use kit-hooks instead */
// Gets native and token balances
export const useBalancesSummary = ({ chainIds, ...args }: UseBalancesSummaryArgs) => {
  const indexerClients = useIndexerClients(chainIds)

  return useQuery({
    queryKey: [QUERY_KEYS.balancesSummary, chainIds, args],
    queryFn: async () => {
      const res = (
        await Promise.all(
          Array.from(indexerClients.entries()).map(([chainId, indexerClient]) => getBalancesSummary(indexerClient, chainId, args))
        )
      ).flat()

      return res
    },
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: chainIds.length > 0 && !!args.filter.accountAddresses[0]
  })
}

/** @deprecated Use useCoinBalanceSummary instead */
interface UseCoinBalanceArgs extends GetTokenBalancesArgs {
  chainId: number
}

/** @deprecated Use useCoinBalanceSummaryArgs instead */
export const useCoinBalance = (args: UseCoinBalanceArgs) => {
  const indexerClient = useIndexerClient(args.chainId)

  return useQuery({
    queryKey: [QUERY_KEYS.coinBalance, args],
    queryFn: async () => {
      if (compareAddress(args?.contractAddress || '', zeroAddress)) {
        const res = await getNativeTokenBalance(indexerClient, args.chainId, args.accountAddress)
        return res
      } else {
        const res = await getTokenBalances(indexerClient, args)
        return res[0]
      }
    },
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.accountAddress
  })
}

interface UseCoinBalanceSummaryArgs extends GetTokenBalancesSummaryArgs {
  chainId: number
}

/** @deprecated Use kit-hooks instead */
export const useCoinBalanceSummary = (args: UseCoinBalanceSummaryArgs) => {
  const indexerClient = useIndexerClient(args.chainId)

  return useQuery({
    queryKey: [QUERY_KEYS.coinBalanceSummary, args],
    queryFn: async () => {
      if (compareAddress(args?.filter.contractWhitelist?.[0] || '', zeroAddress)) {
        const res = await getNativeTokenBalance(indexerClient, args.chainId, args.filter.accountAddresses[0] || '')
        return res
      } else {
        const res = await getTokenBalancesSummary(indexerClient, args)
        return res[0]
      }
    },
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.filter.accountAddresses[0]
  })
}

/** @deprecated Use useCollectibleBalanceDetailsArgs instead */
interface UseCollectibleBalanceArgs {
  accountAddress: string
  chainId: number
  contractAddress: string
  tokenId: string
  verifiedOnly?: boolean
}

/** @deprecated Use useCollectibleBalanceDetails instead */
export const useCollectibleBalance = (args: UseCollectibleBalanceArgs) => {
  const indexerClient = useIndexerClient(args.chainId)

  return useQuery({
    queryKey: [QUERY_KEYS.collectibleBalance, args],
    queryFn: async () => {
      const res = await indexerClient.getTokenBalances({
        accountAddress: args.accountAddress,
        contractAddress: args.contractAddress,
        tokenID: args.tokenId,
        includeMetadata: true,
        metadataOptions: {
          verifiedOnly: args.verifiedOnly ?? true
        }
      })

      return res.balances[0]
    },
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.accountAddress && !!args.contractAddress && !!args.tokenId
  })
}

interface UseCollectibleBalanceDetailsArgs extends GetTokenBalancesDetailsArgs {
  chainId: number
  tokenId: string
}

/** @deprecated Use kit-hooks instead */
export const useCollectibleBalanceDetails = (args: UseCollectibleBalanceDetailsArgs) => {
  const indexerClient = useIndexerClient(args.chainId)

  return useQuery({
    queryKey: [QUERY_KEYS.collectibleBalanceDetails, args],
    queryFn: async () => {
      const res = await indexerClient.getTokenBalancesDetails(args)

      const balance = res.balances.find(balance => balance.tokenID === args.tokenId)

      return balance
    },
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.filter.accountAddresses[0] && !!args.tokenId
  })
}

/** @deprecated Use getCollectionBalanceDetails instead */
export const getCollectionBalance = async (indexerClient: SequenceIndexer, args: UseCollectionBalanceArgs) => {
  const res = await indexerClient.getTokenBalances({
    accountAddress: args.accountAddress,
    contractAddress: args.contractAddress,
    includeMetadata: args.includeMetadata ?? true,
    metadataOptions: {
      verifiedOnly: args.verifiedOnly ?? true
    }
  })

  return res?.balances || []
}

/** @deprecated Use useCollectionBalanceArgs instead */
interface UseCollectionBalanceArgs {
  chainId: number
  accountAddress: string
  contractAddress: string
  includeMetadata?: boolean
  verifiedOnly?: boolean
}

/** @deprecated Use useCollectionBalanceDetails instead */
export const useCollectionBalance = (args: UseCollectionBalanceArgs) => {
  const indexerClient = useIndexerClient(args.chainId)

  return useQuery({
    queryKey: [QUERY_KEYS.collectionBalanceDetails, args],
    queryFn: () => getCollectionBalance(indexerClient, args),
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.accountAddress && !!args.contractAddress
  })
}

export const getCollectionBalanceDetails = async (indexerClient: SequenceIndexer, args: UseCollectionBalanceDetailsArgs) => {
  const res = await indexerClient.getTokenBalancesDetails(args)

  return res?.balances || []
}

interface UseCollectionBalanceDetailsArgs extends GetTokenBalancesDetailsArgs {
  chainId: number
}

/** @deprecated Use kit-hooks instead */
export const useCollectionBalanceDetails = (args: UseCollectionBalanceDetailsArgs) => {
  const indexerClient = useIndexerClient(args.chainId)

  return useQuery({
    queryKey: [QUERY_KEYS.collectionBalanceDetails, args],
    queryFn: () => getCollectionBalanceDetails(indexerClient, args),
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.filter.accountAddresses[0]
  })
}

// From USD to another currency
/** @deprecated Use kit-hooks instead */
export const useExchangeRate = (toCurrency: string) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: [QUERY_KEYS.exchangeRate, toCurrency],
    queryFn: async () => {
      if (toCurrency === 'USD') {
        return 1
      }

      const res = await apiClient.getExchangeRate({ toCurrency })

      return res.exchangeRate.value
    },
    retry: true,
    staleTime: time.oneMinute * 10
  })
}

/** @deprecated Use kit-hooks instead */
export const getCoinPrices = async (apiClient: SequenceAPIClient, tokens: Token[]) => {
  if (tokens.length === 0) {
    return []
  }

  const res = await apiClient.getCoinPrices({ tokens })

  return res?.tokenPrices || []
}

/** @deprecated Use kit-hooks instead */
export const useCoinPrices = (tokens: Token[], disabled?: boolean) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: [QUERY_KEYS.coinPrices, tokens],
    queryFn: () => getCoinPrices(apiClient, tokens),
    retry: true,
    staleTime: time.oneMinute,
    enabled: tokens.length > 0 && !disabled
  })
}

export const getCollectiblePrices = async (apiClient: SequenceAPIClient, tokens: Token[]) => {
  if (tokens.length === 0) {
    return []
  }

  const res = await apiClient.getCollectiblePrices({ tokens })

  return res?.tokenPrices || []
}

/** @deprecated Use kit-hooks instead */
export const useCollectiblePrices = (tokens: Token[]) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: [QUERY_KEYS.collectiblePrices, tokens],
    queryFn: () => getCollectiblePrices(apiClient, tokens),
    retry: true,
    staleTime: time.oneMinute,
    enabled: tokens.length > 0
  })
}

/** @deprecated Use kit-hooks instead */
export const useTokenMetadata = (chainId: number, contractAddress: string, tokenIds: string[], disabled?: boolean) => {
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: [QUERY_KEYS.tokenMetadata, chainId, contractAddress, tokenIds],
    queryFn: async () => {
      const res = await metadataClient.getTokenMetadata({
        chainID: String(chainId),
        contractAddress,
        tokenIDs: tokenIds
      })

      return res.tokenMetadata
    },
    retry: true,
    staleTime: time.oneMinute * 10,
    enabled: !!chainId && !!contractAddress && !disabled
  })
}

/** @deprecated Use kit-hooks instead */
export const useContractInfo = (chainId: number, contractAddress: string, disabled?: boolean) => {
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: [QUERY_KEYS.contractInfo, chainId, contractAddress],
    queryFn: async () => {
      const isNativeToken = compareAddress(zeroAddress, contractAddress)

      const res = await metadataClient.getContractInfo({
        chainID: String(chainId),
        contractAddress
      })
      const network = findSupportedNetwork(chainId)

      return {
        ...res.contractInfo,
        ...(isNativeToken && network
          ? {
              ...network.nativeToken,
              logoURI: network.logoURI
            }
          : {})
      }
    },
    retry: true,
    staleTime: time.oneMinute * 10,
    enabled: !!chainId && !!contractAddress && !disabled
  })
}

export interface GetTransactionHistoryArgs {
  accountAddress: string
  contractAddress?: string
  tokenId?: string
  page?: Page
}

export const getTransactionHistory = async (
  indexerClient: SequenceIndexer,
  { contractAddress, accountAddress, tokenId, page }: GetTransactionHistoryArgs
) => {
  const res = indexerClient.getTransactionHistory({
    includeMetadata: true,
    page,
    filter: {
      accountAddress,
      contractAddress,
      tokenID: tokenId
    }
  })

  return res
}

interface UseTransactionHistoryArgs {
  chainId: number
  accountAddress: string
  contractAddress?: string
  tokenId?: string
  disabled?: boolean
}

/** @deprecated Use kit-hooks instead */
export const useTransactionHistory = (args: UseTransactionHistoryArgs) => {
  const indexerClient = useIndexerClient(args.chainId)

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.transactionHistory, args],
    queryFn: ({ pageParam }) => {
      return getTransactionHistory(indexerClient, {
        ...args,
        page: { page: pageParam }
      })
    },
    getNextPageParam: ({ page }) => {
      // Note: must return undefined instead of null to stop the infinite scroll
      if (!page.more) {
        return undefined
      }

      return page?.page || 1
    },
    initialPageParam: 1,
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.accountAddress
  })
}

interface Balance {
  balance: string
}

export type SwapPricesWithCurrencyInfo = {
  price: SwapPrice
  info: ContractInfo | undefined
  balance: Balance
}

const getSwapPrices = async (
  apiClient: SequenceAPIClient,
  metadataClient: SequenceMetadata,
  indexerClient: SequenceIndexer,
  args: UseSwapPricesArgs
): Promise<SwapPricesWithCurrencyInfo[]> => {
  if (!args.chainId || !args.userAddress || !args.buyCurrencyAddress || !args.buyAmount || args.buyAmount === '0') {
    return []
  }

  try {
    const network = findSupportedNetwork(args.chainId)

    const { withContractInfo, ...swapPricesArgs } = args

    const res = await apiClient.getSwapPrices({
      ...swapPricesArgs
    })

    if (res.swapPrices === null) {
      return []
    }

    const currencyInfoMap = new Map<string, Promise<ContractInfo | undefined>>()
    if (withContractInfo) {
      res?.swapPrices.forEach(price => {
        const { currencyAddress: rawCurrencyAddress } = price
        const currencyAddress = compareAddress(rawCurrencyAddress, NATIVE_TOKEN_ADDRESS_0X) ? zeroAddress : rawCurrencyAddress
        const isNativeToken = compareAddress(currencyAddress, zeroAddress)
        if (currencyAddress && !currencyInfoMap.has(currencyAddress)) {
          const getNativeTokenInfo = () =>
            new Promise<ContractInfo>(resolve => {
              resolve({
                ...network?.nativeToken,
                logoURI: network?.logoURI || '',
                address: zeroAddress
              } as ContractInfo)
            })

          currencyInfoMap.set(
            currencyAddress,
            isNativeToken
              ? getNativeTokenInfo().then(data => {
                  return data
                })
              : metadataClient
                  .getContractInfo({
                    chainID: String(args.chainId),
                    contractAddress: currencyAddress
                  })
                  .then(data => {
                    return {
                      ...data.contractInfo
                    }
                  })
          )
        }
      })
    }

    const currencyBalanceInfoMap = new Map<string, Promise<Balance>>()
    res?.swapPrices.forEach(price => {
      const { currencyAddress: rawCurrencyAddress } = price
      const currencyAddress = compareAddress(rawCurrencyAddress, NATIVE_TOKEN_ADDRESS_0X) ? zeroAddress : rawCurrencyAddress
      const isNativeToken = compareAddress(currencyAddress, zeroAddress)

      if (currencyAddress && !currencyBalanceInfoMap.has(currencyAddress)) {
        currencyBalanceInfoMap.set(
          currencyAddress,
          isNativeToken
            ? indexerClient
                .getNativeTokenBalance({
                  accountAddress: args.userAddress
                })
                .then(res => ({
                  balance: res.balance.balance
                }))
            : indexerClient
                .getTokenBalancesSummary({
                  filter: {
                    accountAddresses: [args.userAddress],
                    contractStatus: ContractVerificationStatus.VERIFIED,
                    contractWhitelist: [currencyAddress],
                    omitNativeBalances: true
                  },
                  omitMetadata: true
                })
                .then(res => ({
                  balance: res.balances?.[0].balance || '0'
                }))
        )
      }
    })

    return Promise.all(
      res?.swapPrices.map(async price => {
        const { currencyAddress: rawCurrencyAddress } = price
        const currencyAddress = compareAddress(rawCurrencyAddress, NATIVE_TOKEN_ADDRESS_0X) ? zeroAddress : rawCurrencyAddress

        return {
          price: {
            ...price,
            currencyAddress
          },
          info: (await currencyInfoMap.get(currencyAddress)) || undefined,
          balance: (await currencyBalanceInfoMap.get(currencyAddress)) || { balance: '0' }
        }
      }) || []
    )
  } catch (e) {
    console.error(e)
    return []
  }
}

interface UseSwapPricesArgs {
  userAddress: string
  buyCurrencyAddress: string
  buyAmount: string
  chainId: number
  withContractInfo?: boolean
}

interface SwapPricesOptions {
  disabled?: boolean
}

/** @deprecated Use kit-hooks instead */
export const useSwapPrices = (args: UseSwapPricesArgs, options: SwapPricesOptions) => {
  const apiClient = useAPIClient()
  const metadataClient = useMetadataClient()
  const indexerClient = useIndexerClient(args.chainId)

  const enabled =
    !!args.chainId &&
    !!args.userAddress &&
    !!args.buyCurrencyAddress &&
    !!args.buyAmount &&
    args.buyAmount !== '0' &&
    !options.disabled

  return useQuery({
    queryKey: [QUERY_KEYS.swapPrices, args],
    queryFn: () => getSwapPrices(apiClient, metadataClient, indexerClient, args),
    retry: true,
    // We must keep a long staletime to avoid the list of quotes being refreshed while the user is doing the transactions
    // Instead, we will invalidate the query manually
    staleTime: time.oneHour,
    enabled
  })
}

interface UseSwapQuoteOptions {
  disabled?: boolean
}

/** @deprecated Use kit-hooks instead */
export const useSwapQuote = (args: GetSwapQuoteArgs, options: UseSwapQuoteOptions) => {
  const apiClient = useAPIClient()
  const { disabled = false } = options

  return useQuery({
    queryKey: [QUERY_KEYS.swapQuotes, args],
    queryFn: async () => {
      const res = await apiClient.getSwapQuote({
        ...args,
        buyCurrencyAddress: compareAddress(args.buyCurrencyAddress, zeroAddress)
          ? NATIVE_TOKEN_ADDRESS_0X
          : args.buyCurrencyAddress,
        sellCurrencyAddress: compareAddress(args.sellCurrencyAddress, zeroAddress)
          ? NATIVE_TOKEN_ADDRESS_0X
          : args.sellCurrencyAddress
      })

      return {
        ...res.swapQuote,
        currencyAddress: compareAddress(res.swapQuote.currencyAddress, NATIVE_TOKEN_ADDRESS_0X)
          ? zeroAddress
          : res.swapQuote.currencyAddress
      }
    },
    retry: true,
    staleTime: time.oneMinute * 1,
    enabled: !disabled || !args.userAddress || !args.chainId || !args.buyCurrencyAddress
  })
}

interface UseCurrencyInfoArgs {
  chainId: number
  currencyAddress: string
}

/** @deprecated Use kit-hooks instead */
export const useCurrencyInfo = (args: UseCurrencyInfoArgs) => {
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: [QUERY_KEYS.currencyInfo, args],
    queryFn: async () => {
      const network = findSupportedNetwork(args.chainId)

      const isNativeToken = compareAddress(args.currencyAddress, zeroAddress)

      if (isNativeToken) {
        return {
          ...network?.nativeToken,
          logoURI: network?.logoURI || '',
          address: zeroAddress
        } as ContractInfo
      }

      const res = await metadataClient.getContractInfo({
        chainID: String(args.chainId),
        contractAddress: args.currencyAddress
      })

      return {
        ...res.contractInfo
      }
    },
    retry: true,
    staleTime: time.oneMinute * 10,
    enabled: !!args.chainId && !!args.currencyAddress
  })
}
