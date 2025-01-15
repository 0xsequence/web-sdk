import { SequenceAPIClient, Token, SwapPrice, GetSwapQuoteArgs } from '@0xsequence/api'
import { ContractType, Page, SequenceIndexer, TokenBalance } from '@0xsequence/indexer'
import { ContractInfo, SequenceMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork } from '@0xsequence/network'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { zeroAddress } from 'viem'

import { compareAddress } from '../utils/helpers'
import { NATIVE_TOKEN_ADDRESS_0X } from '../constants'

import { useAPIClient } from './useAPIClient'
import { useIndexerClient, useIndexerClients } from './useIndexerClient'
import { useMetadataClient } from './useMetadataClient'

import {
  ContractVerificationStatus,
  GetTokenBalancesSummaryArgs,
  GetTokenBalancesDetailsArgs,
  GetTokenBalancesByContractArgs
} from '@0xsequence/indexer'

export const time = {
  oneSecond: 1 * 1000,
  oneMinute: 60 * 1000,
  oneHour: 60 * 60 * 1000
}

export const getNativeTokenBalance = async (indexerClient: SequenceIndexer, chainId: number, accountAddress: string) => {
  const res = await indexerClient.getNativeTokenBalance({ accountAddress })

  const tokenBalance: TokenBalance = {
    chainId,
    contractAddress: zeroAddress,
    accountAddress,
    balance: res?.balance.balance || '0',
    contractType: ContractType.UNKNOWN,
    blockHash: '',
    blockNumber: 0,
    tokenID: '',
    uniqueCollectibles: '',
    isSummary: false
  }

  return tokenBalance
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

export const getTokenBalancesSummary = async (indexerClient: SequenceIndexer, args: GetTokenBalancesSummaryArgs) => {
  const res = await indexerClient.getTokenBalancesSummary(args)
  return res?.balances || []
}

export const getTokenBalancesDetails = async (indexerClient: SequenceIndexer, args: GetTokenBalancesDetailsArgs) => {
  const res = await indexerClient.getTokenBalancesDetails(args)
  return res?.balances || []
}

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
    queryKey: ['balances', chainIds, args],
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

// Gets native and token balances
export const useBalancesSummary = ({ chainIds, ...args }: UseBalancesSummaryArgs) => {
  const indexerClients = useIndexerClients(chainIds)

  return useQuery({
    queryKey: ['balancesSummary', chainIds, args],
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
    queryKey: ['coinBalance', args],
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

export const useCoinBalanceSummary = (args: UseCoinBalanceSummaryArgs) => {
  const indexerClient = useIndexerClient(args.chainId)

  return useQuery({
    queryKey: ['coinBalanceSummary', args],
    queryFn: async () => {
      if (compareAddress(args?.filter.contractWhitelist[0] || '', zeroAddress)) {
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
    queryKey: ['collectibleBalance', args],
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

export const useCollectibleBalanceDetails = (args: UseCollectibleBalanceDetailsArgs) => {
  const indexerClient = useIndexerClient(args.chainId)

  return useQuery({
    queryKey: ['collectibleBalanceDetails', args],
    queryFn: async () => {
      const res = await indexerClient.getTokenBalancesDetails(args)

      const balance = res.balances.find(balance => balance.tokenID === args.tokenId)

      return balance
    },
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.filter.accountAddresses[0] && !!args.filter.contractWhitelist[0] && !!args.tokenId
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
    queryKey: ['collectionBalance', args],
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

export const useCollectionBalanceDetails = (args: UseCollectionBalanceDetailsArgs) => {
  const indexerClient = useIndexerClient(args.chainId)

  return useQuery({
    queryKey: ['collectionBalanceDetails', args],
    queryFn: () => getCollectionBalanceDetails(indexerClient, args),
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.filter.accountAddresses[0] && !!args.filter.contractWhitelist[0]
  })
}

// From USD to another currency
export const useExchangeRate = (toCurrency: string) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: ['exchangeRate', toCurrency],
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

export const getCoinPrices = async (apiClient: SequenceAPIClient, tokens: Token[]) => {
  if (tokens.length === 0) {
    return []
  }

  const res = await apiClient.getCoinPrices({ tokens })

  return res?.tokenPrices || []
}

export const useCoinPrices = (tokens: Token[], disabled?: boolean) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: ['coinPrices', tokens],
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

export const useCollectiblePrices = (tokens: Token[]) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: ['useCollectiblePrices', tokens],
    queryFn: () => getCollectiblePrices(apiClient, tokens),
    retry: true,
    staleTime: time.oneMinute,
    enabled: tokens.length > 0
  })
}

export const useTokenMetadata = (chainId: number, contractAddress: string, tokenIds: string[], disabled?: boolean) => {
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: ['tokenMetadata', chainId, contractAddress, tokenIds],
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

export const useContractInfo = (chainId: number, contractAddress: string, disabled?: boolean) => {
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: ['contractInfo', chainId, contractAddress],
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

export const useTransactionHistory = (args: UseTransactionHistoryArgs) => {
  const indexerClient = useIndexerClient(args.chainId)

  return useInfiniteQuery({
    queryKey: ['transactionHistory', args],
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
            new Promise<ContractInfo>((resolve, reject) => {
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
                    contractBlacklist: []
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
    queryKey: ['swapPrices', args],
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

export const useSwapQuote = (args: GetSwapQuoteArgs, options: UseSwapQuoteOptions) => {
  const apiClient = useAPIClient()
  const { disabled = false } = options

  return useQuery({
    queryKey: ['useSwapQuote', args],
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
