import { GetContractInfoArgs, ContractInfo } from '@0xsequence/metadata'
import { TokenBalance, GetTransactionHistoryReturn, Transaction, TokenMetadata } from '@0xsequence/indexer'
import { TokenPrice } from '@0xsequence/api'
import { ethers } from 'ethers'
import { useQuery, useInfiniteQuery, UseQueryResult, UseInfiniteQueryResult } from '@tanstack/react-query'
import {
  fetchBalances,
  GetTokenBalancesArgs,
  fetchCollectionBalance,
  GetCollectionBalanceArgs,
  getCoinPrices,
  GetCoinPricesArgs,
  fetchBalancesAssetsSummary,
  getNativeToken,
  getTokenBalances,
  getCollectibleBalance,
  GetCollectibleBalanceArgs,
  getCollectiblePrices,
  GetCollectiblePricesArgs,
  getTransactionHistory,
  GetTransactionHistoryArgs,
  fetchFiatConversionRate,
  FetchFiatConversionRateArgs,
  GetTokenBalancesOptions,
  FetchBalancesAssetsArgs,
  getTransactionHistorySummary,
  GetTransactionHistorySummaryArgs,
  fetchTokenMetadata,
  FetchTokenMetadataArgs,
  getContractInfo
} from '../api/data'

import { compareAddress } from '../utils/helpers'

export const time = {
  oneSecond: 1 * 1000,
  oneMinute: 60 * 1000,
  oneHour: 60 * 60 * 1000
}

export interface UseBalancesArgs extends Omit<GetTokenBalancesArgs, 'chainId'> {
  chainIds: number[]
}

export const useBalances = (args: UseBalancesArgs, options: GetTokenBalancesOptions) =>
  useQuery({
    queryKey: ['balances', args, options],
    queryFn: async () => {
      const { chainIds, ...restArgs } = args
      const balances = await Promise.all(chainIds.map(chainId => fetchBalances({ ...restArgs, chainId }, options)))
      return balances.flat()
    },
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: args.chainIds.length > 0 && !!args.accountAddress
  })

export const useCollectionBalance = (args: GetCollectionBalanceArgs) =>
  useQuery({
    queryKey: ['collectionBalance', args],
    queryFn: () => fetchCollectionBalance(args),
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.accountAddress && !!args.collectionAddress
  })

export const useCoinPrices = ({
  disabled,
  ...args
}: GetCoinPricesArgs & { disabled?: boolean }): UseQueryResult<TokenPrice[] | undefined> =>
  useQuery({
    queryKey: ['coinPrices', args],
    queryFn: () => getCoinPrices(args),
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: args.tokens.length > 0 && !disabled
  })

export const useBalancesAssetsSummary = (args: FetchBalancesAssetsArgs, options: GetTokenBalancesOptions) =>
  useQuery({
    queryKey: ['balancesAssetsSummary', args, options],
    queryFn: () => fetchBalancesAssetsSummary(args, options),
    retry: true,
    refetchInterval: time.oneSecond * 4,
    refetchOnMount: true,
    staleTime: time.oneSecond,
    enabled: args.chainIds.length > 0 && !!args.accountAddress
  })

export const useCoinBalance = (args: GetTokenBalancesArgs, options: GetTokenBalancesOptions) =>
  useQuery({
    queryKey: ['coinBalance', args, options],
    queryFn: (): Promise<TokenBalance> => {
      if (compareAddress(args?.contractAddress || '', ethers.constants.AddressZero)) {
        const response = getNativeToken({
          accountAddress: args.accountAddress,
          chainId: args.chainId
        }).then(response => response[0])
        return response
      }
      const response = getTokenBalances(args, options).then(response => response[0])
      return response
    },
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.accountAddress
  })

export const useCollectibleBalance = (args: GetCollectibleBalanceArgs) =>
  useQuery({
    queryKey: ['collectibleBalance', args],
    queryFn: () => getCollectibleBalance(args),
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.accountAddress && !!args.collectionAddress && !!args.tokenId
  })

export const useCollectiblePrices = (args: GetCollectiblePricesArgs) =>
  useQuery({
    queryKey: ['useCollectiblePrices', args],
    queryFn: () => getCollectiblePrices(args),
    retry: true,
    staleTime: time.oneMinute,
    enabled: args.tokens.length > 0
  })

export const useTransactionHistory = (
  arg: Omit<GetTransactionHistoryArgs, 'page'> & { disabled?: boolean }
): UseInfiniteQueryResult<GetTransactionHistoryReturn> =>
  useInfiniteQuery({
    queryKey: ['transactionHistory', arg],
    queryFn: ({ pageParam }: { pageParam?: number }) => {
      return getTransactionHistory({
        ...(arg as Omit<GetTransactionHistoryArgs, 'page'>),
        ...(pageParam ? { page: { page: pageParam } } : { page: { page: 1 } })
      })
    },
    getNextPageParam: ({ page }) => {
      // Note: must return undefined instead of null to stop the infinite scroll
      if (!page.more) return undefined

      return page?.page || 1
    },
    retry: true,
    staleTime: time.oneSecond * 30,
    enabled: !!arg.chainId && !arg.disabled && !!arg.accountAddress
  })

export const useTransactionHistorySummary = (args: GetTransactionHistorySummaryArgs): UseQueryResult<Transaction[]> =>
  useQuery({
    queryKey: ['transactionHistorySummary', args],
    queryFn: () => getTransactionHistorySummary(args),
    retry: true,
    staleTime: time.oneSecond,
    refetchOnMount: true,
    enabled: args.chainIds.length > 0 && !!args.accountAddress
  })

export const useConversionRate = (args: FetchFiatConversionRateArgs) =>
  useQuery({
    queryKey: ['useConversionRate', args],
    queryFn: () => fetchFiatConversionRate(args),
    retry: true,
    staleTime: time.oneMinute * 10
  })

export const useTokenMetadata = (args: FetchTokenMetadataArgs): UseQueryResult<TokenMetadata[]> =>
  useQuery({
    queryKey: ['useTokenMetadata', args],
    queryFn: () => fetchTokenMetadata(args),
    retry: true,
    staleTime: time.oneMinute * 10,
    enabled: !!args.tokens.chainId && !!args.tokens.contractAddress
  })

export const useContractInfo = (args: GetContractInfoArgs): UseQueryResult<ContractInfo> =>
  useQuery({
    queryKey: ['useContractInfo', args],
    queryFn: () => getContractInfo(args),
    retry: true,
    staleTime: time.oneMinute * 10,
    enabled: !!args.chainID && !!args.contractAddress
  })
