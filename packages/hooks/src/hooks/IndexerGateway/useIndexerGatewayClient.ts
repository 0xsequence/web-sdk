import { SequenceIndexerGateway } from '@0xsequence/indexer'
import { useMemo } from 'react'

import { useConfig } from '../useConfig.js'

/**
 * Hook that provides an indexer gateway client for querying token balances across multiple chains.
 * Unlike the regular indexer client, the gateway client can fetch token data from multiple
 * chains in a single request.
 *
 * @returns A SequenceIndexerGateway instance
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useIndexerGatewayClient} for more detailed documentation.
 *
 * @example
 * ```tsx
 * import { useIndexerGatewayClient } from '@0xsequence/hooks'
 *
 * const TokenBalances = () => {
 *   const indexerGatewayClient = useIndexerGatewayClient()
 *
 *   // Get balances across multiple chains in one call
 *   const { data } = useGetTokenBalancesSummary({
 *     filter: {
 *       accountAddresses: [address],
 *       omitNativeBalances: false
 *     }
 *   })
 * }
 * ```
 */
export const useIndexerGatewayClient = () => {
  const { env, projectAccessKey, jwt } = useConfig()

  const indexerGatewayClient = useMemo(() => {
    return new SequenceIndexerGateway(env.indexerGatewayUrl, projectAccessKey, jwt)
  }, [projectAccessKey, jwt])

  return indexerGatewayClient
}
