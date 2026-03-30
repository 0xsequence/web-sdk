import { SequenceAPIClient, type Token, type TokenPrice } from '@0xsequence/api'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants.js'
import type { QueryHookOptions } from '../../types/hooks.js'

import { useAPIClient } from './useAPIClient.js'

/**
 * Helper function to fetch coin prices from the Sequence API.
 *
 * @param apiClient - The Sequence API client instance
 * @param tokens - Array of tokens to get prices for, each containing chainId and contractAddress
 * @returns Array of token prices, or empty array if no tokens provided
 * @internal
 */
const getCoinPrices = async (apiClient: SequenceAPIClient, tokens: Token[]) => {
  if (tokens.length === 0) {
    return []
  }

  const res = await apiClient.getCoinPrices({ tokens })

  return res?.tokenPrices || []
}

/**
 * Hook to fetch current prices for a list of tokens.
 *
 * This hook uses React Query to fetch and cache token prices from the Sequence API.
 * Prices are automatically refreshed every minute to ensure they stay current.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks-sdk/hooks/useGetCoinPrices} for more detailed documentation.
 *
 * @param tokens - Array of tokens to get prices for. Each token must include:
 *   - chainId: The chain ID where the token exists
 *   - contractAddress: The token's contract address (use ZERO_ADDRESS for native tokens)
 *
 * @param options - React Query options (except queryKey and queryFn which are managed by the hook).
 *   Defaults: retry: false, staleTime: 1 minute.
 *
 * @example
 * ```tsx
 * const { data: prices, isLoading, error } = useGetCoinPrices([
 *   {
 *     chainId: 1,
 *     contractAddress: ZERO_ADDRESS // ETH
 *   },
 *   {
 *     chainId: 137,
 *     contractAddress: '0x...' // USDC on Polygon
 *   }
 * ])
 * ```
 */
export const useGetCoinPrices = (tokens: Token[], options?: QueryHookOptions<TokenPrice[]>) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetCoinPrices, tokens],
    queryFn: () => getCoinPrices(apiClient, tokens),
    retry: false,
    staleTime: time.oneMinute,
    enabled: tokens.length > 0,
    ...options
  })
}
