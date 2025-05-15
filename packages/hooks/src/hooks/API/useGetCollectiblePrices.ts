import { SequenceAPIClient, type Token } from '@0xsequence/api'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants.js'
import type { HooksOptions } from '../../types/hooks.js'

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
 * Used in various UI components to display NFT valuations, particularly in collection views
 * and transaction details.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetCollectiblePrices} for more detailed documentation.
 *
 * @param tokens - Array of tokens to get prices for. Each token must include:
 *   - chainId: The chain ID where the NFT exists
 *   - contractAddress: The NFT collection's contract address
 *   - tokenId: The specific token ID within the collection
 *
 * @param options - Optional configuration options:
 *   - retry: Whether to retry failed requests (defaults to false)
 *   - disabled: Whether to disable the query
 *
 * @returns React Query result object containing:
 *   - data: Array of token prices when available, each containing:
 *     - price: The price for the collection
 *     - price24hChange: The price change for the collection in the last 24 hours (if available)
 *     - floorPrice: The floor price for the collection (if available)
 *     - buyPrice: Current market buy price (if available)
 *     - sellPrice: Current market sell price (if available)
 *   - isLoading: Whether the initial request is in progress
 *   - error: Any error that occurred
 *   - isError: Whether an error occurred
 *   - isSuccess: Whether the request was successful
 *
 * @example
 * ```tsx
 * const { data: prices, isLoading } = useGetCollectiblePrices([
 *   {
 *     chainId: 1,
 *     contractAddress: '0x...',  // NFT collection address
 *     tokenId: '123'            // Specific NFT ID
 *   }
 * ])
 *
 * if (isLoading) {
 *   return <div>Loading prices...</div>
 * }
 *
 * if (prices?.[0]) {
 *   console.log('Price:', prices[0].price.value)
 * }
 * ```
 */
export const useGetCollectiblePrices = (tokens: Token[], options?: HooksOptions) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetCollectiblePrices, tokens, options],
    queryFn: () => getCollectiblePrices(apiClient, tokens),
    retry: options?.retry ?? false,
    staleTime: time.oneMinute,
    enabled: tokens.length > 0 && !options?.disabled
  })
}
