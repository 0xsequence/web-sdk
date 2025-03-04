import { IndexerGateway, SequenceIndexerGateway, TokenBalance } from '@0xsequence/indexer'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { HooksOptions } from '../../types'
import { createNativeTokenBalance } from '../../utils/helpers'

import { useIndexerGatewayClient } from './useIndexerGatewayClient'

const getNativeTokenBalance = async (
  indexerGatewayClient: SequenceIndexerGateway,
  getNativeTokenBalanceArgs: IndexerGateway.GetNativeTokenBalanceArgs
): Promise<TokenBalance[]> => {
  const res = await indexerGatewayClient.getNativeTokenBalance(getNativeTokenBalanceArgs)

  const balances = res.balances.map(balances =>
    createNativeTokenBalance(balances.chainId, balances.result.accountAddress, balances.result.balance)
  )

  return balances
}

/**
 * @description Gets the native token balance for a list of given networks or chainIds
 */
export const useGetNativeTokenBalance = (
  getNativeTokenBalanceArgs: IndexerGateway.GetNativeTokenBalanceArgs,
  options?: HooksOptions
) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetNativeTokenBalance, getNativeTokenBalanceArgs, options],
    queryFn: async () => await getNativeTokenBalance(indexerGatewayClient, getNativeTokenBalanceArgs),
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!getNativeTokenBalanceArgs.accountAddress && !options?.disabled
  })
}
