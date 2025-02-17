import { ContractType, IndexerGateway, SequenceIndexerGateway, TokenBalance } from '@0xsequence/indexer'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { BalanceHookOptions } from '../../types'

import { useIndexerGatewayClient } from './useIndexerGatewayClient'

const getTokenBalancesByContract = async (
  indexerGatewayClient: SequenceIndexerGateway,
  getTokenBalancesByContractArgs: IndexerGateway.GetTokenBalancesByContractArgs,
  hideCollectibles: boolean
): Promise<TokenBalance[]> => {
  const res = await indexerGatewayClient.getTokenBalancesByContract(getTokenBalancesByContractArgs)

  if (hideCollectibles) {
    for (const chainBalance of res.balances) {
      chainBalance.results = chainBalance.results.filter(
        result => result.contractType !== ContractType.ERC721 && result.contractType !== ContractType.ERC1155
      )
    }
  }

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
      return await getTokenBalancesByContract(
        indexerGatewayClient,
        getTokenBalancesByContractArgs,
        options?.hideCollectibles ?? false
      )
    },
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!getTokenBalancesByContractArgs.filter.accountAddresses?.[0] && !options?.disabled
  })
}
