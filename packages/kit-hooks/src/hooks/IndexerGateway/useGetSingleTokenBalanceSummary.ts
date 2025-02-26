import { useQuery } from '@tanstack/react-query'

import { ZERO_ADDRESS } from '../../constants'
import { QUERY_KEYS, time } from '../../constants'
import { BalanceHookOptions } from '../../types'
import { compareAddress, createNativeTokenBalance } from '../../utils/helpers'
import { useIndexerGatewayClient } from './useIndexerGatewayClient'

export interface GetSingleTokenBalanceSummaryArgs {
  chainId: number
  accountAddress: string
  contractAddress: string
}

export const useGetSingleTokenBalanceSummary = (args: GetSingleTokenBalanceSummaryArgs, options?: BalanceHookOptions) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetSingleTokenBalanceSummary, args, options],
    queryFn: async () => {
      const balance = await indexerGatewayClient.getTokenBalancesSummary({
        chainIds: [args.chainId],
        filter: {
          accountAddresses: [args.accountAddress],
          contractWhitelist: [args.contractAddress],
          omitNativeBalances: false
        }
      })

      if (compareAddress(args.contractAddress, ZERO_ADDRESS)) {
        return createNativeTokenBalance(args.chainId, args.accountAddress, balance.nativeBalances[0].results[0].balance)
      } else {
        return balance.balances[0].results[0]
      }
    },
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.accountAddress && !options?.disabled
  })
}
