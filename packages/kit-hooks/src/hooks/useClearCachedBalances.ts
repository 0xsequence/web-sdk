import { useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '../constants'

export const useClearCachedBalances = () => {
  const queryClient = useQueryClient()

  return {
    clearCachedBalances: () => {
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.useGetNativeTokenBalance,
          QUERY_KEYS.useGetTokenBalancesSummary,
          QUERY_KEYS.useGetTokenBalancesDetails,
          QUERY_KEYS.useGetTokenBalancesByContract,
          QUERY_KEYS.useGetTokenMetadata,
          QUERY_KEYS.useGetTransactionHistory,
          QUERY_KEYS.useGetTransactionHistorySummary,
          QUERY_KEYS.useGetContractInfo,
          QUERY_KEYS.useGetMultipleContractInfo,
          QUERY_KEYS.useGetSingleTokenBalanceSummary,
          QUERY_KEYS.useGetExchangeRate,
          QUERY_KEYS.useGetCoinPrices,
          QUERY_KEYS.useGetCollectiblePrices,
          QUERY_KEYS.useGetSwapPrices,
          QUERY_KEYS.useGetSwapQuote
        ]
      })
    }
  }
}
