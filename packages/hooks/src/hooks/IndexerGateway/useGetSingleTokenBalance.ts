import { SequenceIndexerGateway } from '@0xsequence/indexer'
import { useQuery } from '@tanstack/react-query'

import { ZERO_ADDRESS, QUERY_KEYS, time } from '../../constants'
import { HooksOptions } from '../../types'
import { compareAddress, createNativeTokenBalance } from '../../utils/helpers'

import { useIndexerGatewayClient } from './useIndexerGatewayClient'

export interface GetSingleTokenBalanceArgs {
  chainId: number
  accountAddress: string
  contractAddress: string
  tokenId?: string
}

const getSingleTokenBalance = async (args: GetSingleTokenBalanceArgs, indexerGatewayClient: SequenceIndexerGateway) => {
  const balance = await indexerGatewayClient.getTokenBalancesDetails({
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
    if (args.tokenId) {
      return balance.balances[0].results.find(result => result.tokenID === args.tokenId)
    } else {
      return balance.balances[0].results[0]
    }
  }
}

/**
 * @description Gets the single token balance details for a given chainId and contractAddress
 */
export const useGetSingleTokenBalance = (args: GetSingleTokenBalanceArgs, options?: HooksOptions) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetSingleTokenBalance, args, options],
    queryFn: async () => {
      return await getSingleTokenBalance(args, indexerGatewayClient)
    },
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.accountAddress && !options?.disabled
  })
}
