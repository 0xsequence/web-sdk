import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { BalanceHookOptions } from '../../types'
import { useIndexerGatewayClient } from './useIndexerGatewayClient'

import { IndexerGateway, SequenceIndexerGateway, TokenBalance } from '@0xsequence/indexer'

const getTokenBalancesByContract = async (
  indexerGatewayClient: SequenceIndexerGateway,
  getTokenBalancesByContractArgs: IndexerGateway.GetTokenBalancesByContractArgs
): Promise<TokenBalance[]> => {
  const res = await indexerGatewayClient.getTokenBalancesByContract(getTokenBalancesByContractArgs)

  return res.balances.flatMap(balance => balance.results)
}

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
