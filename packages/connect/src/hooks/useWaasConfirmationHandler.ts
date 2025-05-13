import type { commons } from '@0xsequence/core'
import { useEffect, useState } from 'react'

import { Deferred } from '../utils/deferred.js'

let _pendingConfirmation: Deferred<{ id: string; confirmed: boolean }> | undefined

export type WaasRequestConfirmation = {
  id: string
  type: 'signTransaction' | 'signMessage'
  message?: string
  txs?: commons.transaction.Transaction[]
  chainId?: number
}

/**
 * Hook to handle transaction and message signing confirmations for WaaS (Wallet-as-a-Service) connections.
 *
 * This hook sets up confirmation handlers for signing transactions and messages when using a WaaS connector.
 * It manages the state of pending confirmations and provides functions to confirm or reject signing requests.
 *
 * @param waasConnector - The WaaS connector instance to handle confirmations for (optional)
 *
 * @returns A tuple containing:
 * - [0] {@link WaasRequestConfirmation} | undefined - The current pending request confirmation info or undefined if none
 * - [1] `(id: string) => void` - Function to confirm a pending request by ID
 * - [2] `(id: string) => void` - Function to reject a pending request by ID
 *
 * The {@link WaasRequestConfirmation} object contains:
 * - `id` - Unique identifier for the request
 * - `type` - Either 'signTransaction' or 'signMessage'
 * - `message?` - Optional message to sign (for signMessage requests)
 * - `txs?` - Optional array of transactions (for signTransaction requests)
 * - `chainId?` - Optional chain ID for the request
 *
 * @example
 * ```tsx
 * const [
 *   pendingRequestConfirmation,
 *   confirmPendingRequest,
 *   rejectPendingRequest
 * ] = useWaasConfirmationHandler(waasConnector)
 *
 * // When user confirms the request
 * if (pendingRequestConfirmation) {
 *   confirmPendingRequest(pendingRequestConfirmation.id)
 * }
 *
 * // When user rejects the request
 * if (pendingRequestConfirmation) {
 *   rejectPendingRequest(pendingRequestConfirmation.id)
 * }
 * ```
 */
export function useWaasConfirmationHandler(
  waasConnector?: any
): [WaasRequestConfirmation | undefined, (id: string) => void, (id: string) => void] {
  const [pendingRequestConfirmation, setPendingRequestConfirmation] = useState<WaasRequestConfirmation | undefined>()

  function confirmPendingRequest(id: string) {
    _pendingConfirmation?.resolve({ id, confirmed: true })
    setPendingRequestConfirmation(undefined)
    _pendingConfirmation = undefined
  }

  function rejectPendingRequest(id: string) {
    _pendingConfirmation?.resolve({ id, confirmed: false })
    setPendingRequestConfirmation(undefined)
    _pendingConfirmation = undefined
  }

  useEffect(() => {
    async function setup() {
      if (!waasConnector) {
        return
      }

      const waasProvider = waasConnector.sequenceWaasProvider

      if (!waasProvider) {
        return
      }

      waasProvider.requestConfirmationHandler = {
        confirmSignTransactionRequest(
          id: string,
          txs: commons.transaction.Transaction[],
          chainId: number
        ): Promise<{ id: string; confirmed: boolean }> {
          const pending = new Deferred<{ id: string; confirmed: boolean }>()
          setPendingRequestConfirmation({ id, type: 'signTransaction', txs: Array.isArray(txs) ? txs : [txs], chainId })
          _pendingConfirmation = pending
          return pending.promise
        },
        confirmSignMessageRequest(id: string, message: string, chainId: number): Promise<{ id: string; confirmed: boolean }> {
          const pending = new Deferred<{ id: string; confirmed: boolean }>()
          setPendingRequestConfirmation({ id, type: 'signMessage', message, chainId })
          _pendingConfirmation = pending
          return pending.promise
        }
      }
    }
    setup()
  })

  return [pendingRequestConfirmation, confirmPendingRequest, rejectPendingRequest]
}
