import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useConfig, type Storage } from 'wagmi'

import type { StorageItem } from '../types.js'

/**
 * Hook to access the storage instance configured in the Sequence Connect client.
 *
 * This hook provides access to the Storage instance that is used for persisting
 * authentication data, wallet state, and other client-side storage needs.
 * It is commonly used for operations that require access to the storage layer,
 * such as generating authentication proofs.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useStorage} for more detailed documentation.
 *
 * @returns The Storage instance if available, or null if not configured {@link Storage} or null
 *
 * @example
 * ```tsx
 * import { useStorage, signEthAuthProof, validateEthProof } from '@0xsequence/connect'
 * import { useWalletClient, usePublicClient } from 'wagmi'
 *
 * const YourComponent = () => {
 *   const { data: walletClient } = useWalletClient()
 *   const publicClient = usePublicClient()
 *   const storage = useStorage()
 *
 *   const generateEthAuthProof = async () => {
 *     if (!walletClient || !publicClient || !storage) {
 *       return
 *     }
 *
 *     try {
 *       // Use storage to generate an auth proof
 *       const proof = await signEthAuthProof(walletClient, storage)
 *       console.log('proof:', proof)
 *
 *       const isValid = await validateEthProof(walletClient, publicClient, proof)
 *       console.log('isValid?:', isValid)
 *     } catch (e) {
 *       console.error(e)
 *     }
 *   }
 *
 *   return (
 *     <button onClick={generateEthAuthProof}>
 *       Generate EthAuth Proof
 *     </button>
 *   )
 * }
 * ```
 */
export const useStorage = (): Storage<StorageItem> | null => {
  const config = useConfig()

  if (!config.storage) {
    return null
  }

  return config.storage as Storage<StorageItem>
}

/**
 * Hook to retrieve a specific item from the Sequence Connect storage.
 *
 * This hook allows you to access specific items stored in the Connect storage layer,
 * and provides the full react-query API for data fetching, caching, and revalidation.
 *
 * @param {K} key - The key of the storage item to retrieve
 * @returns {UseQueryResult<StorageItem[K]>} A react-query result containing the storage item data
 *
 * @example
 * ```tsx
 * import { useStorageItem } from '@0xsequence/connect'
 *
 * const YourComponent = () => {
 *   const { data: authToken, isLoading } = useStorageItem('authToken')
 *
 *   if (isLoading) {
 *     return <div>Loading...</div>
 *   }
 *
 *   return (
 *     <div>
 *       {authToken ? 'Authenticated' : 'Not authenticated'}
 *     </div>
 *   )
 * }
 * ```
 */
export const useStorageItem = <K extends keyof StorageItem>(key: K): UseQueryResult<StorageItem[K] | null> => {
  const storage = useStorage()

  return useQuery({
    queryKey: ['storage', key],
    queryFn: async () => {
      return storage?.getItem(key) ?? null
    },
    retry: true,
    enabled: !!storage
  })
}
