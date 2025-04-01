import { useConnectConfigContext } from '../contexts/ConnectConfig.js'

/**
 * Hook to access the project access key from the Sequence Connect configuration.
 *
 * The project access key is a required configuration parameter used to authenticate and
 * identify your application with Sequence services. It is used across various SDK features
 * including marketplace integration and wallet connections.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useProjectAccessKey} for more detailed documentation.
 *
 * @returns {string} The project access key configured for the application
 *
 * @example
 * ```tsx
 * const projectAccessKey = useProjectAccessKey()
 * const marketplaceClient = new MarketplaceIndexer(apiUrl, projectAccessKey)
 * ```
 */
export const useProjectAccessKey = () => {
  const { projectAccessKey } = useConnectConfigContext()

  return projectAccessKey
}
