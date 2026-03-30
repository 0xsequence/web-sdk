import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants.js'
import type { QueryHookOptions } from '../../types/hooks.js'
import { useConfig } from '../useConfig.js'

/**
 * Hook to fetch the version of a contract.
 *
 * This hook uses React Query to fetch and cache the version of a contract.
 *
 * @param args - The arguments for the hook:
 *   - contractAddress: The address of the contract
 *   - chainId: The chain id of the contract
 *
 * @param options - React Query options (except queryKey and queryFn which are managed by the hook).
 *   Defaults: retry: false, staleTime: 60 minutes.
 */

interface DetectContractVersionArgs {
  contractAddress: string
  chainId: number
}

export const useDetectContractVersion = (args: DetectContractVersionArgs, options?: QueryHookOptions<any>) => {
  const { projectAccessKey, env } = useConfig()

  return useQuery({
    queryKey: [QUERY_KEYS.useDetectContractVersion, args.contractAddress, args.chainId],
    queryFn: async () => {
      const res = await fetch(`${env.builderUrl}/rpc/ContractLibrary/DetectContractVersion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Access-Key': projectAccessKey },
        body: JSON.stringify({ address: args.contractAddress, chainId: args.chainId })
      })
      const data = await res.json()
      return data
    },
    retry: false,
    staleTime: time.oneMinute * 60,
    enabled: !!args.contractAddress && !!args.chainId,
    ...options
  })
}
