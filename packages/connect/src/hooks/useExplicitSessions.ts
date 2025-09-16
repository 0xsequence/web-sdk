'use client'

import { Signers, type DappClient, type Session } from '@0xsequence/dapp-client'
import { type ChainId } from '@0xsequence/network'
import { useCallback, useState } from 'react'
import { useConnections } from 'wagmi'
import { type Connector } from 'wagmi'

export type UseExplicitSessiosnReturnType = {
  /**
   * A boolean indicating if the session request operation is in progress.
   */
  isLoading: boolean
  /**
   * An error object if the last operation failed, otherwise null.
   */
  error: Error | null
  /**
   * Function to request a new explicit session with a set of explicit session from the user.
   * This will typically open a popup asking the user to approve the explicit session.
   *
   * @param chainId The chain ID for the new session.
   * @param explicitSession The explicit session to request for the new session.
   * @returns A promise that resolves when the request is sent, or rejects if an error occurs.
   */
  addExplicitSession: (chainId: ChainId, explicitSession: Signers.Session.ExplicitParams) => Promise<void>

  /**
   * Function to get all explicit sessions.
   *
   * @returns A promise that resolves when the sessions are found, or rejects if an error occurs.
   */
  getExplicitSessions: () => Promise<Session[]>
}

/**
 * A hook to manage user explicit sessions for a Sequence V3 wallet connection.
 * Provides a method to create additional explicit sessions for the user.
 *
 * @returns An object with the state and function to manage explicit sessions. {@link UseExplicitSessionReturnType}
 *
 */
export function useExplicitSessions(): UseExplicitSessiosnReturnType {
  const connections = useConnections()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const addExplicitSession = useCallback(
    async (chainId: ChainId, explicitSession: Signers.Session.ExplicitParams) => {
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
        await dappClient.addExplicitSession(chainId, explicitSession)
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

  const getExplicitSessions = useCallback(async () => {
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

    const sessions = dappClient.getAllSessions()
    const explicitSessions = sessions.filter(session => session.isImplicit === false)

    return explicitSessions
  }, [connections])

  return { isLoading, error, addExplicitSession, getExplicitSessions }
}
