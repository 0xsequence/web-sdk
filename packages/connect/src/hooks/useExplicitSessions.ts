'use client'

import { type DappClient, type ExplicitSession } from '@0xsequence/dapp-client'
import { useCallback, useState } from 'react'
import { parseEther, parseUnits, type Address } from 'viem'
import { useConnections } from 'wagmi'
import { type Connector } from 'wagmi'

import { SEQUENCE_VALUE_FORWARDER } from '../utils/session/constants.js'
import { createContractPermission } from '../utils/session/createContractPermission.js'
import { createExplicitSessionConfig } from '../utils/session/createExplicitSessionParams.js'
import type { ExplicitSessionParams } from '../utils/session/types.js'

export type UseExplicitSessionsReturnType = {
  /**
   * A boolean indicating if the session request operation is in progress.
   */
  isLoading: boolean
  /**
   * An error object if the last operation failed, otherwise null.
   */
  error: Error | null

  /**
   * Function to add a new explicit session.
   * This will open a popup asking the user to approve the new explicit session.
   *
   * @param params The explicit session params needed to create an explicit session {@link ExplicitSessionParams}.
   * @param includeFeeOptionPermissions Whether to request fee option permissions with this session (Used to pay for gas fees).
   * @returns A promise that resolves when the request is sent, or rejects if an error occurs.
   */
  addExplicitSession: (params: ExplicitSessionParams, includeFeeOptionPermissions?: boolean) => Promise<void>

  /**
   * Function to modify an existing explicit session.
   * This will open a popup asking the user to approve the modified session.
   *
   * @param modifiedExplicitSession The modified explicit session {@link ExplicitSession}.
   * @returns A promise that resolves when the request is sent, or rejects if an error occurs.
   *
   * @example
   * ```ts
   * import { useExplicitSessions, createContractPermission } from "@0xsequence/connect"
   *
   * const Example = () => {
   *   const { getExplicitSessions, modifyExplicitSession } = useExplicitSessions()
   *
   *   const modifySession = async () => {
   *     const currentSessions = await getExplicitSessions()
   *     const sessionToModify = currentSessions[0]
   *
   *     const newPermission = createContractPermission({
   *       address: '0x7E485D0DA0392a0273E7e599c0fc066739E0Fe89',
   *       functionSignature: 'function testContract() public'
   *     })
   *
   *     const modifiedSession = {
   *       ...sessionToModify,
   *       permissions: [...sessionToModify.permissions!, newPermission]
   *     }
   *     modifyExplicitSession(modifiedSession)
   *   }
   *
   *   return (
   *     <div>
   *       <button onClick={modifySession}>Modify Session</button>
   *     </div>
   *   )
   * }
   *
   * export default Example
   * ```
   */
  modifyExplicitSession: (modifiedExplicitSession: ExplicitSession) => Promise<void>

  /**
   * Function to get all explicit sessions.
   *
   * @returns A promise that resolves with an array of all explicit sessions, or rejects if an error occurs.
   */
  getExplicitSessions: () => Promise<ExplicitSession[]>
}

/**
 * A hook to manage user explicit sessions for a Sequence V3 wallet connection.
 * Provides methods to create, modify, and retrieve explicit sessions for the user.
 *
 * @returns An object with the state and functions to manage explicit sessions. {@link UseExplicitSessionsReturnType}
 */
export function useExplicitSessions(): UseExplicitSessionsReturnType {
  const connections = useConnections()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Helper function to get the DappClient instance from the active connector
  const getDappClient = useCallback((): DappClient => {
    const v3Connector: Connector | undefined = connections.find(c => c.connector.id.includes('sequence-v3-wallet'))?.connector

    if (!v3Connector) {
      const err = new Error('Sequence V3 connector not found. Make sure the user is connected.')
      setError(err)
      throw err
    }

    const dappClient = (v3Connector as any).client as DappClient

    if (!dappClient) {
      const err = new Error('DappClient instance is not available on the connector.')
      setError(err)
      throw err
    }

    return dappClient
  }, [connections])

  const addExplicitSession = useCallback(
    async (params: ExplicitSessionParams, includeFeeOptionPermissions?: boolean) => {
      const dappClient = getDappClient()

      setIsLoading(true)
      setError(null)

      if (includeFeeOptionPermissions) {
        params.permissions.push({
          target: SEQUENCE_VALUE_FORWARDER,
          rules: []
        })
        const { tokens, isFeeRequired, paymentAddress } = await dappClient.getFeeTokens(params.chainId)
        if (tokens && isFeeRequired) {
          const feeOptionPermissions = tokens.map(token =>
            createContractPermission({
              address: token.contractAddress as Address,
              functionSignature: 'function transfer(address to, uint256 value)',
              rules: [
                {
                  param: 'value',
                  type: 'uint256',
                  condition: 'LESS_THAN_OR_EQUAL',
                  value: token.decimals === 18 ? parseEther('0.1') : parseUnits('50', token.decimals || 6)
                },
                {
                  param: 'to',
                  type: 'address',
                  condition: 'EQUAL',
                  value: paymentAddress as Address
                }
              ]
            })
          )
          params.permissions.push(...feeOptionPermissions)
        }
      }

      const explicitSessionConfig = createExplicitSessionConfig(params)

      try {
        // Call the underlying DappClient method
        await dappClient.addExplicitSession(explicitSessionConfig)
      } catch (e: any) {
        setError(e)
        // Re-throw the error so the calling component can also handle it if needed
        throw e
      } finally {
        setIsLoading(false)
      }
    },
    [getDappClient] // Recalculate the function if the dappClient changes
  )

  const modifyExplicitSession = useCallback(
    async (modifiedExplicitSession: ExplicitSession) => {
      const dappClient = getDappClient()

      setIsLoading(true)
      setError(null)

      try {
        // Call the underlying DappClient method
        await dappClient.modifyExplicitSession(modifiedExplicitSession)
      } catch (e: any) {
        setError(e)
        // Re-throw the error so the calling component can also handle it if needed
        throw e
      } finally {
        setIsLoading(false)
      }
    },
    [getDappClient] // Recalculate the function if the dappClient changes
  )

  const getExplicitSessions = useCallback(async (): Promise<ExplicitSession[]> => {
    const dappClient = getDappClient()

    const explicitSessions = dappClient.getAllExplicitSessions()

    return explicitSessions
  }, [getDappClient])

  return { isLoading, error, addExplicitSession, modifyExplicitSession, getExplicitSessions }
}
