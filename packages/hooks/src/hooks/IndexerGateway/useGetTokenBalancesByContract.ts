import { IndexerGateway, Page, SequenceIndexerGateway } from '@0xsequence/indexer'
import { useInfiniteQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { HooksOptions } from '../../types'

import { useIndexerGatewayClient } from './useIndexerGatewayClient'

const getTokenBalancesByContract = async (
  indexerGatewayClient: SequenceIndexerGateway,
  args: IndexerGateway.GetTokenBalancesByContractArgs
) => {
  const res = await indexerGatewayClient.getTokenBalancesByContract(args)

  return {
    balances: res.balances.flatMap(balance => balance.results),
    page: res.page
  }
}

/**
 * @description Gets the token balances for a given list of contractAddresses
 */
export const useGetTokenBalancesByContract = (args: IndexerGateway.GetTokenBalancesByContractArgs, options?: HooksOptions) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.useGetTokenBalancesByContract, args, options],
    queryFn: ({ pageParam }) => {
      return getTokenBalancesByContract(indexerGatewayClient, { ...args, page: pageParam })
    },
    getNextPageParam: ({ page }) => {
      return page?.more ? page : undefined
    },
    initialPageParam: { pageSize: args.page?.pageSize } as Page,
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: args.filter.contractAddresses.length > 0 && !options?.disabled
  })
}
