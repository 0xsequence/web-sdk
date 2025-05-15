import { SequenceMetadata, type GetTokenMetadataArgs } from '@0xsequence/metadata'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants.js'
import type { HooksOptions } from '../../types/hooks.js'
import { splitEvery } from '../../utils/helpers.js'
import { useConfig } from '../useConfig.js'

import { useMetadataClient } from './useMetadataClient.js'

const getTokenMetadata = async (metadataClient: SequenceMetadata, args: GetTokenMetadataArgs, imageProxyUrl: string) => {
  const { chainID, contractAddress, tokenIDs } = args

  // metadata api has a "50 tokenID request limit per contract" rate limit
  const tokenIDChunks = splitEvery(50, tokenIDs)

  const metadataResults = await Promise.all(
    tokenIDChunks.map(tokenIDs =>
      metadataClient.getTokenMetadata({
        chainID: chainID,
        contractAddress: contractAddress,
        tokenIDs: tokenIDs
      })
    )
  )

  const data = metadataResults.map(mr => mr.tokenMetadata).flat()

  data.forEach(d => {
    if (d?.image) {
      d.image = `${imageProxyUrl}${d.image}`
    }
  })

  return data
}

/**
 * Hook to fetch token-specific metadata for individual tokens within a contract.
 * This differs from {@link useGetContractInfo} which returns contract-level information.
 * This hook is specifically for getting metadata about individual token IDs (like NFT attributes,
 * images, etc).
 *
 * Optimized for batch fetching with automatic chunking of token IDs to respect
 * rate limits (50 tokens per request).
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetTokenMetadata} for more detailed documentation.
 *
 * @param getTokenMetadataArgs - Arguments for fetching token metadata
 * @param getTokenMetadataArgs.chainID - Chain ID as string (e.g., "1" for Ethereum mainnet)
 * @param getTokenMetadataArgs.contractAddress - Contract address of the token/NFT
 * @param getTokenMetadataArgs.tokenIDs - Array of token IDs to fetch metadata for. Each ID represents a specific token
 * @param options - Optional configuration for the query behavior
 * @param options.disabled - If true, disables the query from automatically running
 * @param options.retry - If true, retries failed queries
 *
 * Query configuration:
 * - Marks data as stale after 1 hour
 * - Retries failed requests by default
 * - Only enabled when chainID and contractAddress are present and not explicitly disabled
 * - Automatically chunks requests into batches of 50 tokens to respect API limits
 *
 * @returns Query result containing an array of token metadata objects, each containing:
 * - `name`: Name of the specific token (e.g., "Bored Ape #1234")
 * - `description`: Description of the specific token
 * - `image`: Token-specific image URL (proxied through image service)
 * - `attributes`: Token-specific attributes/traits (for NFTs)
 * - `decimals`: Token decimals (for ERC1155 tokens)
 * - Additional token-specific metadata
 *
 * @example
 * ```tsx
 * // Fetch metadata for a specific NFT
 * function NFTDetails() {
 *   const { data: tokensMetadata } = useGetTokenMetadata({
 *     chainID: "1",
 *     contractAddress: "0xbc4ca0...",
 *     tokenIDs: ["1234"]
 *   })
 *
 *   const nft = tokensMetadata?.[0]
 *
 *   return (
 *     <div>
 *       <img src={nft?.image} alt={nft?.name} />
 *       <h2>{nft?.name}</h2>
 *       <p>{nft?.description}</p>
 *       {nft?.attributes?.map(attr => (
 *         <div key={attr.trait_type}>
 *           {attr.trait_type}: {attr.value}
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 *
 * // Fetch metadata for multiple tokens in a transaction
 * function TransactionDetails() {
 *   const { data: tokenMetadata } = useGetTokenMetadata({
 *     chainID: String(chainId),
 *     contractAddress,
 *     tokenIDs: transferProps.tokenIds  // Array of transferred token IDs
 *   })
 *
 *   return (
 *     <div>
 *       {tokenMetadata?.map(token => (
 *         <div key={token.id} className="token-transfer">
 *           <CollectibleTileImage imageUrl={token.image} />
 *           <Text>{token.name}</Text>
 *           {token.attributes && (
 *             <div className="attributes">
 *               Token attributes here
 *             </div>
 *           )}
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export const useGetTokenMetadata = (args: GetTokenMetadataArgs, options?: HooksOptions) => {
  const { env } = useConfig()
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetTokenMetadata, args, options],
    queryFn: () => getTokenMetadata(metadataClient, args, env.imageProxyUrl),
    retry: options?.retry ?? false,
    staleTime: time.oneHour,
    enabled: !!args.chainID && !!args.contractAddress && !options?.disabled
  })
}
