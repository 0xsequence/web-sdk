import { useConnect } from 'wagmi'

import type { EcosystemConnector } from '../connectors/ecosystem/ecosystemWallet'

/**
 * Hook to directly connect to an ecosystem wallet with email
 *
 * @returns A function that triggers the ecosystem wallet connection
 * @throws {Error} If the ecosystem wallet connector is not found among available connectors
 *
 * The returned function accepts:
 * - `auxData` (optional) - Additional data to pass to the ecosystem connector during connection
 *
 * @example
 * ```tsx
 * const triggerConnect = useDirectEcosystemConnect()
 *
 * // Connect without auxiliary data
 * await triggerConnect()
 *
 * // Connect with auxiliary data
 * await triggerConnect({
 *   someKey: 'someValue',
 *   anotherKey: 123
 * })
 *
 * // Handle connection errors
 * try {
 *   await triggerConnect()
 * } catch (error) {
 *   if (error.message === 'Ecosystem wallet connector not found') {
 *     console.error('Ecosystem wallet is not configured')
 *   }
 * }
 * ```
 */
export const useDirectEcosystemConnect = () => {
  const { connectors, connect } = useConnect()

  const triggerConnect = async (auxData?: Record<string, unknown>) => {
    const ecosystemConnector = connectors.find(
      (connector): connector is EcosystemConnector => connector.type === 'ecosystem-wallet'
    )

    if (!ecosystemConnector) {
      throw new Error('Ecosystem wallet connector not found')
    }

    if (auxData) {
      ecosystemConnector.auxData = auxData
    }

    return connect({ connector: ecosystemConnector })
  }

  return triggerConnect
}
