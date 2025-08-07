import { useQuery } from '@tanstack/react-query'

import { useConfig } from '../useConfig.js'
import { QUERY_KEYS, time } from '../../constants.js'
import type { HooksOptions } from '../../types/hooks.js'

/**
 * Hook to fetch the version of a contract.
 *
 * This hook uses React Query to fetch and cache the version of a contract.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useFindVersion} for more detailed documentation.
 *
 * @param args - The arguments for the hook:
 *   - uid: The UID of the contract
 *   - hash: The hash of the contract
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

interface FindVersionArgs {
  uid: string
  hash: string
}

export const useFindVersion = (args: FindVersionArgs, options?: HooksOptions) => {
  const { projectAccessKey, env } = useConfig()

  return useQuery({
    queryKey: [QUERY_KEYS.useFindVersion, args.uid, args.hash, options],
    queryFn: async () => {
      const res = await fetch(`${env.builderUrl}/rpc/ContractLibrary/FindVersion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Access-Key': projectAccessKey },
        body: JSON.stringify({ uid: args.uid, hash: args.hash })
      })
      const data = await res.json()
      return data
    },
    retry: options?.retry ?? false,
    staleTime: time.oneMinute * 60,
    enabled: !!args.uid && !!args.hash && !options?.disabled
  })
}
