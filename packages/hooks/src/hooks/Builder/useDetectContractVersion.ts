import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants.js'
import type { HooksOptions } from '../../types/hooks.js'
import { useConfig } from '../useConfig.js'

/**
 * Hook to fetch the version of a contract.
 *
 * This hook uses React Query to fetch and cache the version of a contract.
 *
 *
 * @param args - The arguments for the hook:
 *   - address: The address of the contract
 *   - chainId: The chain id of the contract
 *
 * @param options - Optional configuration options:
 *   - retry: Whether to retry failed requests (defaults to false)
 *   - disabled: Whether to disable the query
 *
 * @returns React Query result object containing:
 *   - data: The version of the contract
 *   - isLoading: Whether the initial request is in progress
 *   - error: Any error that occurred
 *   - isError: Whether an error occurred
 *   - isSuccess: Whether the request was successful
 *
 */

interface DetectContractVersionArgs {
  contractAddress: string
  chainId: number
}

export const useDetectContractVersion = (args: DetectContractVersionArgs, options?: HooksOptions) => {
  const { projectAccessKey, env } = useConfig()

  return useQuery({
    queryKey: [QUERY_KEYS.useDetectContractVersion, args.contractAddress, args.chainId, options],
    queryFn: async () => {
      const res = await fetch(`${env.builderUrl}/rpc/ContractLibrary/DetectContractVersion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Access-Key': projectAccessKey },
        body: JSON.stringify({ address: args.contractAddress, chainId: args.chainId })
      })
      const data = await res.json()
      return data
    },
    retry: options?.retry ?? false,
    staleTime: time.oneMinute * 60,
    enabled: !!args.contractAddress && !!args.chainId && !options?.disabled
  })
}
