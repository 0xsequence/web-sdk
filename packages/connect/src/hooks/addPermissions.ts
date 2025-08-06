'use client'

import { type DappClient } from '@0xsequence/dapp-client'
import { type ChainId } from '@0xsequence/network'
import { type Signers } from '@0xsequence/wallet-core'
import { useCallback, useState } from 'react'
import { useConnections } from 'wagmi'
import { type Connector } from 'wagmi'

export type UsePermissionsReturnType = {
  /**
   * A boolean indicating if the permission request operation is in progress.
   */
  isLoading: boolean
  /**
   * An error object if the last operation failed, otherwise null.
   */
  error: Error | null
  /**
   * Function to request a new explicit session with a set of permissions from the user.
   * This will typically open a popup asking the user to approve the permissions.
   *
   * @param chainId The chain ID for the new session.
   * @param permissions The permissions to request for the new session.
   * @returns A promise that resolves when the request is sent, or rejects if an error occurs.
   */
  addPermissions: (chainId: ChainId, permissions: Signers.Session.ExplicitParams) => Promise<void>
}

/**
 * A hook to manage user permissions for a Sequence V3 wallet connection.
 * Provides a method to request additional explicit sessions (permissions) from the user.
 *
 * @returns An object with the state and function to manage permissions. {@link UsePermissionsReturnType}
 *
 * @example
 * ```tsx
 * import { usePermissions } from './hooks/usePermissions';
 * import { Signers, Utils } from '@0xsequence/wallet-core';
 * import { parseUnits } from 'viem';
 *
 * function MyComponent() {
 *   const { addPermissions, isLoading, error } = usePermissions();
 *
 *   const handleGrantPermissions = async () => {
 *     // Example: request permission to spend 100 USDC on Polygon
 *     const usdcContractAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
 *     const amount = parseUnits('100', 6);
 *
 *     const permissions: Signers.Session.ExplicitParams = {
 *       chainId: 137n, // BigInt chain ID
 *       // Set a deadline for 1 hour from now
 *       deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
 *       // Define the specific permissions using the builder
 *       permissions: [Utils.ERC20PermissionBuilder.buildTransfer(usdcContractAddress, amount.toString())]
 *     };
 *
 *     try {
 *       await addPermissions(137, permissions);
 *       alert('Permissions requested successfully!');
 *     } catch (e) {
 *       console.error('Failed to request permissions:', e);
 *       alert('Failed to request permissions.');
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleGrantPermissions} disabled={isLoading}>
 *         {isLoading ? 'Requesting...' : 'Grant USDC Spending Permission'}
 *       </button>
 *       {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions(): UsePermissionsReturnType {
  const connections = useConnections()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const addPermissions = useCallback(
    async (chainId: ChainId, permissions: Signers.Session.ExplicitParams) => {
      // Find the active Sequence V3 connector from wagmi's connections
      const v3Connector: Connector | undefined = connections.find(c => c.connector.id.includes('sequence-v3-wallet'))?.connector

      if (!v3Connector) {
        const err = new Error('Sequence V3 connector not found. Make sure the user is connected.')
        setError(err)
        throw err
      }

      // Access the DappClient instance from the connector
      const dappClient = (v3Connector as any).client as DappClient

      if (!dappClient) {
        const err = new Error('DappClient instance is not available on the connector.')
        setError(err)
        throw err
      }

      setIsLoading(true)
      setError(null)

      try {
        // Call the underlying DappClient method
        await dappClient.addExplicitSession(chainId, permissions)
      } catch (e: any) {
        setError(e)
        // Re-throw the error so the calling component can also handle it if needed
        throw e
      } finally {
        setIsLoading(false)
      }
    },
    [connections] // Recalculate the function if the user's connections change
  )

  return { isLoading, error, addPermissions }
}
