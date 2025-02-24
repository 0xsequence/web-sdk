import { useQuery } from '@tanstack/react-query'

import { time } from '../constants/hooks'
import { createNativeTokenBalance } from '../utils/helpers'
import { useIndexerGatewayClient } from './useIndexerGatewayClient'

import { IndexerGateway, SequenceIndexerGateway, TokenBalance } from '@0xsequence/indexer'

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

export const useGetNativeTokenBalance = (
  getNativeTokenBalanceArgs: IndexerGateway.GetNativeTokenBalanceArgs,
  options?: { disabled?: boolean; retry?: boolean }
) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useQuery({
    queryKey: ['nativeTokenBalance', getNativeTokenBalanceArgs, options],
    queryFn: async () => await getNativeTokenBalance(indexerGatewayClient, getNativeTokenBalanceArgs),
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!getNativeTokenBalanceArgs.accountAddress && !options?.disabled
  })
}
