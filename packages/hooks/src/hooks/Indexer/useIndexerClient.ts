import { SequenceIndexer } from '@0xsequence/indexer'
import { ChainId, networks } from '@0xsequence/network'
import { useMemo } from 'react'

import { envString } from '../../utils/envstring.js'
import { useConfig } from '../useConfig.js'
import { useNetwork } from '../useNetwork.js'

/**
 * Hook that creates and manages a Sequence Indexer client for a specific chain.
 *
 * This hook maintains a cached indexer client for the specified chain ID,
 * initializing it with the appropriate indexer URL based on the network
 * and environment configuration.
 *
 * Implementation details:
 * - Creates a new SequenceIndexer instance for the specified chain ID if it doesn't exist
 * - Caches the client in a Map to avoid recreating it unnecessarily
 * - Uses projectAccessKey for authentication
 * - Constructs appropriate indexer URL based on network and environment
 *
 * @param chainId - The chain ID to create an indexer client for
 * @returns A SequenceIndexer instance for the specified chain
 *
 * @throws Error if an indexer client cannot be created for the specified chain ID
 *
 * @example
 * ```typescript
 * const TokenBalanceChecker = () => {
 *   const chainId = useChainId()
 *   const indexerClient = useIndexerClient(chainId)
 *   const { address } = useAccount()
 *
 *   const checkBalance = async () => {
 *     // Get native token balance
 *     const nativeBalance = await indexerClient.getNativeTokenBalance({
 *       accountAddress: address
 *     })
 *
 *     // Get token balances
 *     const tokenBalances = await indexerClient.getTokenBalancesSummary({
 *       filter: {
 *         accountAddresses: [address],
 *         contractStatus: ContractVerificationStatus.ALL,
 *         omitNativeBalances: true
 *       }
 *     })
 *   }
 * }
 * ```
 *
 * @remarks
 * - The client is memoized based on projectAccessKey to prevent recreation
 * - The client is initialized only once per chain ID
 * - The environment configuration determines the indexer URL for the network
 * - Throws an error if the chain ID is not supported or client creation fails
 * - Used internally by useIndexerClients to manage multiple chain clients
 */
export const useIndexerClient = (chainId: ChainId) => {
  const { env, projectAccessKey, jwt } = useConfig()

  const indexerClients = useMemo(() => {
    return new Map<ChainId, SequenceIndexer>()
  }, [projectAccessKey, jwt])

  const network = useNetwork(chainId)
  const indexerUrl = envString(env.indexerUrl, 'indexer', network.name)

  if (!indexerClients.has(chainId)) {
    indexerClients.set(chainId, new SequenceIndexer(indexerUrl, projectAccessKey, jwt))
  }

  const indexerClient = indexerClients.get(chainId)

  if (!indexerClient) {
    throw new Error(`Indexer client not found for chainId: ${chainId}, did you forget to add this Chain?`)
  }

  return indexerClient
}

/**
 * Hook that creates and manages Sequence Indexer clients for multiple chains.
 *
 * This hook maintains a map of indexer clients, one for each specified chain ID.
 * Each client is initialized with the appropriate indexer URL based on the network
 * and environment configuration.
 *
 * Implementation details:
 * - Creates a new SequenceIndexer instance for each unique chain ID
 * - Caches clients in a Map to avoid recreating them unnecessarily
 * - Uses projectAccessKey for authentication
 * - Constructs appropriate indexer URLs based on network and environment
 *
 * @param chainIds - Array of chain IDs to create indexer clients for
 * @returns A Map where keys are chain IDs and values are the corresponding SequenceIndexer instances
 *
 * @throws Error if an indexer client cannot be created for any of the specified chain IDs
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useIndexerClients} for more detailed documentation.
 *
 * @example
 * ```typescript
 * const TransactionFetcher = () => {
 *   // Get indexer clients for Ethereum mainnet and Polygon
 *   const indexerClients = useIndexerClients([1, 137])
 *
 *   // Use the clients to fetch data
 *   const fetchData = async () => {
 *     // Get Ethereum client
 *     const ethClient = indexerClients.get(1)
 *     // Get Polygon client
 *     const polygonClient = indexerClients.get(137)
 *
 *     // Make parallel requests
 *     const [ethData, polygonData] = await Promise.all([
 *       ethClient.getTransactionHistory(...),
 *       polygonClient.getTransactionHistory(...)
 *     ])
 *   }
 * }
 * ```
 *
 * @remarks
 * - The clients are memoized based on projectAccessKey to prevent recreation
 * - Each client is initialized only once per chain ID
 * - The environment configuration determines the indexer URL for each network
 * - Throws an error if a chain ID is not supported or client creation fails
 */
export const useIndexerClients = (chainIds: number[]) => {
  const { env, projectAccessKey, jwt } = useConfig()

  const indexerClients = useMemo(() => {
    return new Map<ChainId, SequenceIndexer>()
  }, [projectAccessKey, jwt])

  const result = new Map<ChainId, SequenceIndexer>()

  for (const chainId of chainIds) {
    const network = networks[chainId as ChainId]
    const indexerUrl = envString(env.indexerUrl, 'indexer', network.name)

    if (!indexerClients.has(chainId)) {
      indexerClients.set(chainId, new SequenceIndexer(indexerUrl, projectAccessKey, jwt))
    }

    const indexerClient = indexerClients.get(chainId)

    if (!indexerClient) {
      throw new Error(`Indexer client not found for chainId: ${chainId}, did you forget to add this Chain?`)
    }

    result.set(chainId, indexerClient)
  }

  return result
}
