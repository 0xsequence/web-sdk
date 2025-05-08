import { SequenceIndexerGateway, type IndexerGateway, type TokenBalance } from '@0xsequence/indexer'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants.js'
import type { HooksOptions } from '../../types/hooks.js'
import { createNativeTokenBalance } from '../../utils/helpers.js'

import { useIndexerGatewayClient } from './useIndexerGatewayClient.js'

const getNativeTokenBalance = async (
  indexerGatewayClient: SequenceIndexerGateway,
  args: IndexerGateway.GetNativeTokenBalanceArgs
): Promise<TokenBalance[]> => {
  const res = await indexerGatewayClient.getNativeTokenBalance(args)

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
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetNativeTokenBalance} for more detailed documentation.
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
export const useGetNativeTokenBalance = (args: IndexerGateway.GetNativeTokenBalanceArgs, options?: HooksOptions) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetNativeTokenBalance, args, options],
    queryFn: async () => await getNativeTokenBalance(indexerGatewayClient, args),
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.accountAddress && !options?.disabled
  })
}
