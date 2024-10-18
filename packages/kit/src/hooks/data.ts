import { SequenceAPIClient, Token, SwapPrice, GetSwapQuoteArgs } from '@0xsequence/api'
import { ContractType, Page, SequenceIndexer, TokenBalance } from '@0xsequence/indexer'
import { ContractInfo, SequenceMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork } from '@0xsequence/network'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { blobsToProofsErrorType, zeroAddress } from 'viem'

import { compareAddress } from '../utils/helpers'
import { NATIVE_TOKEN_ADDRESS_0X } from '../constants'

import { useAPIClient } from './useAPIClient'
import { useIndexerClient, useIndexerClients } from './useIndexerClient'
import { useMetadataClient } from './useMetadataClient'
import { indexer } from '0xsequence/dist/declarations/src/sequence'

export const time = {
  oneSecond: 1 * 1000,
  oneMinute: 60 * 1000,
  oneHour: 60 * 60 * 1000
}

export const getNativeTokenBalance = async (indexerClient: SequenceIndexer, chainId: number, accountAddress: string) => {
  const res = await indexerClient.getEtherBalance({ accountAddress })

  const tokenBalance: TokenBalance = {
    chainId,
    contractAddress: zeroAddress,
    accountAddress,
    balance: res?.balance.balanceWei || '0',
    contractType: ContractType.UNKNOWN,
    blockHash: '',
    blockNumber: 0,
    tokenID: ''
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

interface UseBalancesArgs extends GetTokenBalancesArgs {
  chainIds: number[]
}

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

interface UseCoinBalanceArgs extends GetTokenBalancesArgs {
  chainId: number
}

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

interface UseCollectibleBalanceArgs {
  accountAddress: string
  chainId: number
  contractAddress: string
  tokenId: string
  verifiedOnly?: boolean
}

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

interface UseCollectionBalanceArgs {
  chainId: number
  accountAddress: string
  contractAddress: string
  includeMetadata?: boolean
  verifiedOnly?: boolean
}

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

export const useTokenMetadata = (chainId: number, contractAddress: string, tokenIds: string[]) => {
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
    enabled: !!chainId && !!contractAddress
  })
}

export const useContractInfo = (chainId: number, contractAddress: string) => {
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
    enabled: !!chainId && !!contractAddress
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
      ...swapPricesArgs,
    })

    if (res.swapPrices === null) {
      return []
    }

    const currencyInfoMap = new Map<string, Promise<ContractInfo | undefined>>()
    if (withContractInfo) {
      res?.swapPrices.forEach(price => {
        const { currencyAddress } = price
        const isNativeToken = compareAddress(currencyAddress, NATIVE_TOKEN_ADDRESS_0X)
        if (currencyAddress && !currencyInfoMap.has(currencyAddress)) {
          currencyInfoMap.set(
            currencyAddress,
            metadataClient
              .getContractInfo({
                chainID: String(args.chainId),
                contractAddress: currencyAddress
              })
              .then(data => {
                return ({
                  ...data.contractInfo,
                  ...(isNativeToken ? {
                    ...network?.nativeToken,
                    logoURI: network?.logoURI || ''
                  } : {})
                })
              })
          )
        }
      })
    }

    const currencyBalanceInfoMap = new Map<string, Promise<Balance>>()
    res?.swapPrices.forEach(price => {
      const { currencyAddress } = price
      const isNativeToken = compareAddress(currencyAddress, NATIVE_TOKEN_ADDRESS_0X)
      if (currencyAddress && !currencyBalanceInfoMap.has(currencyAddress)) {
        currencyBalanceInfoMap.set(
          currencyAddress,
          isNativeToken ?
            indexerClient.getEtherBalance({
              accountAddress: args.userAddress
            }).then(res => ({
              balance: res.balance.balanceWei
            }))
          :
          indexerClient
            .getTokenBalances({
              accountAddress: args.userAddress,
              contractAddress: currencyAddress,
              includeMetadata: false,
              metadataOptions: {
                verifiedOnly: true
              }
            })
            .then(balances => {
              return ({
                balance: balances.balances?.[0].balance || '0'
              })
            })
        )
      }
    })

    return Promise.all(
      res?.swapPrices.map(async price => ({
        price,
        info: (await currencyInfoMap.get(price.currencyAddress)) || undefined,
        balance: (await currencyBalanceInfoMap.get(price.currencyAddress)) || { balance: '0' }
      })) || []
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
    !!args.chainId && !!args.userAddress && !!args.buyCurrencyAddress && !!args.buyAmount && args.buyAmount !== '0' && !options.disabled

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

export const useSwapQuote  = (args:GetSwapQuoteArgs,  options: UseSwapQuoteOptions) => {
  const apiClient = useAPIClient()
  const { disabled = false } = options

  return useQuery({
    queryKey: ['useSwapQuote', args],
    queryFn: async () => {
      const res = await apiClient.getSwapQuote(args)

      return res.swapQuote
    },
    retry: true,
    staleTime: time.oneMinute * 1,
    enabled: !disabled || !args.userAddress || !args.chainId || !args.buyCurrencyAddress
  })
}