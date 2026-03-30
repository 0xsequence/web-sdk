import { SequenceAPIClient, type Token, type TokenPrice } from '@0xsequence/api'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants.js'
import type { QueryHookOptions } from '../../types/hooks.js'

import { useAPIClient } from './useAPIClient.js'

/**
 * Helper function to fetch collectible prices from the Sequence API.
 *
 * @param apiClient - The Sequence API client instance
 * @param tokens - Array of tokens to get prices for. Each token should include chainId, contractAddress, and tokenId
 * @returns Array of token prices with floor, buy, and sell prices, or empty array if no tokens provided
 * @internal
 */
const getCollectiblePrices = async (apiClient: SequenceAPIClient, tokens: Token[]) => {
  if (tokens.length === 0) {
    return []
  }

  const res = await apiClient.getCollectiblePrices({ tokens })

  return res?.tokenPrices || []
}

/**
 * Hook to fetch current market prices for NFTs/collectibles.
 *
 * This hook uses React Query to fetch and cache collectible prices from the Sequence API.
 * Prices are automatically refreshed every minute to ensure they stay current.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks-sdk/hooks/useGetCollectiblePrices} for more detailed documentation.
 *
 * @param tokens - Array of tokens to get prices for. Each token must include:
 *   - chainId: The chain ID where the NFT exists
 *   - contractAddress: The NFT collection's contract address
 *   - tokenId: The specific token ID within the collection
 *
 * @param options - React Query options (except queryKey and queryFn which are managed by the hook).
 *   Defaults: retry: false, staleTime: 1 minute.
 *
 * @example
 * ```tsx
 * const { data: prices, isLoading } = useGetCollectiblePrices([
 *   {
 *     chainId: 1,
 *     contractAddress: '0x...',
 *     tokenId: '123'
 *   }
 * ])
 * ```
 */
export const useGetCollectiblePrices = (tokens: Token[], options?: QueryHookOptions<TokenPrice[]>) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetCollectiblePrices, tokens],
    queryFn: () => getCollectiblePrices(apiClient, tokens),
    retry: false,
    staleTime: time.oneMinute,
    enabled: tokens.length > 0,
    ...options
  })
}
