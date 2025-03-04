import { IndexerGateway, SequenceIndexerGateway, TokenBalance } from '@0xsequence/indexer'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { BalanceHookOptions } from '../../types'

import { useIndexerGatewayClient } from './useIndexerGatewayClient'

const getTokenBalancesByContract = async (
  indexerGatewayClient: SequenceIndexerGateway,
  getTokenBalancesByContractArgs: IndexerGateway.GetTokenBalancesByContractArgs
): Promise<TokenBalance[]> => {
  const res = await indexerGatewayClient.getTokenBalancesByContract(getTokenBalancesByContractArgs)

  return res.balances.flatMap(balance => balance.results)
}

/**
 * @description Gets the token balances for a given list of contractAddresses
 */
export const useGetTokenBalancesByContract = (
  getTokenBalancesByContractArgs: IndexerGateway.GetTokenBalancesByContractArgs,
  options?: BalanceHookOptions
) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetTokenBalancesByContract, getTokenBalancesByContractArgs, options],
    queryFn: async () => {
      return await getTokenBalancesByContract(indexerGatewayClient, getTokenBalancesByContractArgs)
    },
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!getTokenBalancesByContractArgs.filter.accountAddresses?.[0] && !options?.disabled
  })
}
