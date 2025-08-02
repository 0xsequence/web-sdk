import { SequenceBuilderClient } from '@0xsequence/builder'
import { useMemo } from 'react'

import { useConfig } from '../useConfig.js'

/**
 * Hook to access the Sequence Builder client instance.
 *
 * This hook provides a memoized instance of the Sequence Builder client that can be used
 * to interact with Sequence services. The client is configured with the project's
 * access key and environment-specific Builder URL.
 *
 * The client instance is memoized based on the project access key, meaning a new
 * instance is only created when the access key changes.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useBuilderClient} for more detailed documentation.
 *
 * @returns {SequenceBuilderClient} A configured instance of the Sequence Builder client
 *
 * @example
 * ```tsx
 * const builderClient = useBuilderClient()
 * ```
 */
export const useBuilderClient = () => {
  const { projectAccessKey, env } = useConfig()

  const builderClient = useMemo(() => {
    return new SequenceBuilderClient(projectAccessKey, env.builderUrl)
  }, [projectAccessKey, env.builderUrl])

  return builderClient
}
