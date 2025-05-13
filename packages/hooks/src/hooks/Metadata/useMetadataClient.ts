import { SequenceMetadata } from '@0xsequence/metadata'
import { useMemo } from 'react'

import { useConfig } from '../useConfig.js'

/**
 * Hook that provides a memoized instance of the Sequence Metadata client.
 * This client is used to fetch token and contract metadata
 * from Sequence's metadata service.
 *
 * Provides access to many other methods in the Sequence Metadata API.
 *
 * The client is configured using the project's environment settings and access key.
 * It's memoized to prevent unnecessary re-instantiation when dependencies haven't changed.
 *
 * Used internally in {@link @0xsequence/hooks} by hooks such as:
 * - {@link useGetTokenMetadata} for fetching token-specific metadata
 * - {@link useGetContractInfo} for fetching contract information
 * - {@link useGetMultipleContractsInfo} for batch fetching contract information
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useMetadataClient} for more detailed documentation.
 *
 * @returns A configured instance of SequenceMetadata client
 *
 * @example
 * ```tsx
 * function CustomMetadataFetch() {
 *   const metadataClient = useMetadataClient()
 *
 *   const fetchCustomMetadata = async () => {
 *     const response = await metadataClient.getContractInfo({
 *       chainID: "1",
 *       contractAddress: "0x123..."
 *     })
 *     // Handle response
 *   }
 *
 *   return <button onClick={fetchCustomMetadata}>Fetch Metadata</button>
 * }
 * ```
 */
export const useMetadataClient = () => {
  const { env, projectAccessKey, jwt } = useConfig()

  const metadataClient = useMemo(() => {
    return new SequenceMetadata(env.metadataUrl, projectAccessKey)
  }, [projectAccessKey, jwt])

  return metadataClient
}
