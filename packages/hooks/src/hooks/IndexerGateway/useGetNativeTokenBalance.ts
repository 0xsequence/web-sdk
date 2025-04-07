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
 * Hook to fetch native token balances (like ETH, POL) across multiple chains for a given address.
 * Uses the indexer gateway client to efficiently fetch balances in a single request.
 *
 * @param getNativeTokenBalanceArgs - Arguments for fetching native token balances
 * @param getNativeTokenBalanceArgs.accountAddress - The address to fetch balances for
 * @param getNativeTokenBalanceArgs.chainIds - Array of chain IDs to fetch balances from
 * @param options - Optional configuration for the query behavior
 *
 * @returns Query result containing an array of TokenBalance objects
 *
 * @example
 * ```tsx
 * import { useGetNativeTokenBalance } from '@0xsequence/hooks'
 *
 * function NativeBalances() {
 *   const { data: balances } = useGetNativeTokenBalance({
 *     accountAddress: '0x123...',
 *     chainIds: [1, 137] // Fetch ETH on Ethereum and MATIC on Polygon
 *   })
 *
 *   return balances?.map(balance => (
 *     <div key={balance.chainId}>
 *       Chain {balance.chainId}: {balance.balance}
 *     </div>
 *   ))
 * }
 * ```
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
