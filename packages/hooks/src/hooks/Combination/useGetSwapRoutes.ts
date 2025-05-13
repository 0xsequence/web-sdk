import { SequenceAPIClient, type GetLifiSwapRoutesArgs, type LifiSwapRoute } from '@0xsequence/api'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants.js'
import type { HooksOptions } from '../../types/hooks.js'
import { useAPIClient } from '../API/useAPIClient.js'

/**
 * Arguments for the useGetSwapRoutes hook
 *
 * @property walletAddress - The address of the user's wallet
 * @property toTokenAddress - The address of the currency to buy
 * @property chainId - The chain ID where the swap will occur
 * @property toTokenAmount - The amount of the currency to buy
 */
export interface UseGetSwapRoutesArgs {
  walletAddress: string
  toTokenAddress: string
  chainId: number
  toTokenAmount: string
}

const getSwapRoutes = async (
  apiClient: SequenceAPIClient,
  args: GetLifiSwapRoutesArgs & { walletAddress: string }
): Promise<LifiSwapRoute[]> => {
  if (!args.chainId || !args.toTokenAddress) {
    return []
  }

  const res = await apiClient.getLifiSwapRoutes({
    chainId: args.chainId,
    walletAddress: args.walletAddress,
    toTokenAddress: args.toTokenAddress,
    toTokenAmount: args.toTokenAmount
  })

  if (res.routes.length === 0) {
    return []
  }

  return res.routes
}

/**
 * Hook to fetch available swap routes for a given token.
 *
 * This hook uses React Query to fetch and cache swap routes from the Sequence API.
 * Stale time is set to one hour by default
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetSwapRoutes} for more detailed documentation.
 *
 * @param args - Arguments for fetching swap routes:
 *   - walletAddress: The address of the user's wallet
 *   - toTokenAddress: The address of the token to buy
 *   - chainId: The chain ID where the swap will occur
 *   - toTokenAmount: The amount of the token to buy
 *
 * @param options - Optional configuration options:
 *   - retry: Whether to retry failed requests (defaults to true)
 *   - disabled: Whether to disable the query
 *
 * @returns React Query result object containing:
 *   - data: Array of available swap routes when available
 *   - isLoading: Whether the initial request is in progress
 *   - error: Any error that occurred
 *   - isError: Whether an error occurred
 *   - isSuccess: Whether the request was successful
 *
 * @example
 * ```tsx
 * const { data: routes, isLoading, error } = useGetSwapRoutes({
 *   walletAddress: '0x123...',
 *   toTokenAddress: '0x456...',
 *   chainId: 1,
 *   toTokenAmount: '1000000000000000000' // 1 ETH in wei
 * })
 *
 * if (isLoading) {
 *   return <div>Loading swap routes...</div>
 * }
 *
 * if (routes?.length) {
 *   console.log('Best route:', routes[0])
 * }
 * ```
 */
export const useGetSwapRoutes = (args: UseGetSwapRoutesArgs, options?: HooksOptions) => {
  const apiClient = useAPIClient()

  const enabled = !!args.chainId && !!args.toTokenAddress && !options?.disabled

  return useQuery({
    queryKey: [QUERY_KEYS.useGetSwapRoutes, args, options],
    queryFn: () => getSwapRoutes(apiClient, args),
    retry: options?.retry ?? true,
    // We must keep a long staletime to avoid the list of quotes being refreshed while the user is doing the transactions
    // Instead, we will invalidate the query manually
    staleTime: time.oneHour,
    enabled
  })
}
