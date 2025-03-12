import { ContractType, SequenceIndexerGateway } from '@0xsequence/indexer'
import { useQuery } from '@tanstack/react-query'

import { ZERO_ADDRESS, QUERY_KEYS, time } from '../../constants'
import { BalanceHookOptions } from '../../types'
import { compareAddress, createNativeTokenBalance } from '../../utils/helpers'

import { useIndexerGatewayClient } from './useIndexerGatewayClient'

export interface GetSingleTokenBalanceSummaryArgs {
  chainId: number
  accountAddress: string
  contractAddress: string
}

const getSingleTokenBalanceSummary = async (
  args: GetSingleTokenBalanceSummaryArgs,
  indexerGatewayClient: SequenceIndexerGateway,
  hideCollectibles: boolean
) => {
  const balance = await indexerGatewayClient.getTokenBalancesSummary({
    chainIds: [args.chainId],
    filter: {
      accountAddresses: [args.accountAddress],
      contractWhitelist: [args.contractAddress],
      omitNativeBalances: false
    }
  })

  if (hideCollectibles) {
    for (const chainBalance of balance.balances) {
      chainBalance.results = chainBalance.results.filter(
        result => result.contractType !== ContractType.ERC721 && result.contractType !== ContractType.ERC1155
      )
    }
  }

  if (compareAddress(args.contractAddress, ZERO_ADDRESS)) {
    return createNativeTokenBalance(args.chainId, args.accountAddress, balance.nativeBalances[0].results[0].balance)
  } else {
    return balance.balances[0].results[0]
  }
}

/**
 * @description Gets the single token balance summary for a given chainId and contractAddress
 */
export const useGetSingleTokenBalanceSummary = (args: GetSingleTokenBalanceSummaryArgs, options?: BalanceHookOptions) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetSingleTokenBalanceSummary, args, options],
    queryFn: async () => {
      return await getSingleTokenBalanceSummary(args, indexerGatewayClient, options?.hideCollectibles ?? false)
    },
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.accountAddress && !options?.disabled
  })
}
