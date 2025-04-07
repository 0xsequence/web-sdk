import { SequenceIndexerGateway } from '@0xsequence/indexer'
import { useMemo } from 'react'

import { useConfig } from '../useConfig'

/**
 * Hook that provides an indexer gateway client for querying token balances across multiple chains.
 * Unlike the regular indexer client, the gateway client can fetch token data from multiple
 * chains in a single request.
 *
 * @returns A SequenceIndexerGateway instance
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
  const { projectAccessKey, env } = useConfig()

  const indexerGatewayClient = useMemo(() => {
    const clientUrl = env.indexerGatewayUrl

    return new SequenceIndexerGateway(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return indexerGatewayClient
}
