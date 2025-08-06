'use client'

import { Relayer } from '@0xsequence/wallet-core'
import { useEffect, useState } from 'react'
import type { TransactionRequest } from 'viem'
import type { Connector } from 'wagmi'
import { useConnections } from 'wagmi'

import { Deferred } from '../utils/deferred.js'

// --- Shared State Management ---
let sharedPendingConfirmation: FeeOptionConfirmation | undefined = undefined
let sharedDeferred: Deferred<{ id: string; feeOption?: Relayer.FeeOption; confirmed: boolean }> | undefined = undefined
let listeners: React.Dispatch<React.SetStateAction<FeeOptionConfirmation | undefined>>[] = []

const notifyListeners = (state: FeeOptionConfirmation | undefined) => listeners.forEach(listener => listener(state))

/**
 * Fee option confirmation data structure
 */
export type FeeOptionConfirmation = {
  /** Unique identifier for the fee confirmation */
  id: string
  /** Available fee options */
  options: Relayer.FeeOption[]
  /** Chain ID where the transaction will be executed */
  chainId: number
}

/**
 * Return type for the useFeeOptions hook
 */
export type UseFeeOptionsReturnType = [
  pendingFeeOptionConfirmation: FeeOptionConfirmation | undefined,
  confirmPendingFeeOption: (id: string, feeOption: Relayer.FeeOption) => void,
  rejectPendingFeeOption: (id: string) => void
]

/**
 * Hook for handling Sequence V3 fee options for unsponsored transactions
 *
 * This hook provides functionality to:
 * - Intercept fee options for a transaction.
 * - Allow the user to select a fee option via a UI component.
 * - Confirm or reject the fee selection.
 *
 * @returns Array containing the confirmation state and control functions {@link UseFeeOptionsReturnType}
 *
 * @example
 * ```tsx
 *   const [
 *     pendingFeeOption,
 *     confirmFeeOption,
 *     rejectFeeOption
 *   ] = useFeeOptions();
 *
 *   if (pendingFeeOption) {
 *     // Render a modal to select a fee from `pendingFeeOption.options`
 *     // On select, call `confirmFeeOption(pendingFeeOption.id, selectedOption)`
 *     // On close/reject, call `rejectFeeOption(pendingFeeOption.id)`
 *   }
 * ```
 */
export function useFeeOptions(): UseFeeOptionsReturnType {
  const connections = useConnections()
  const v3Connector: Connector | undefined = connections.find((c: any) =>
    c.connector.id.includes('sequence-v3-wallet')
  )?.connector

  const [pendingFeeOptionConfirmation, setPendingFeeOptionConfirmation] = useState<FeeOptionConfirmation | undefined>(
    sharedPendingConfirmation
  )

  /**
   * Confirms the selected fee option
   * @param id - The fee confirmation ID
   * @param feeOption - The fee option selected by the user
   */
  function confirmPendingFeeOption(id: string, feeOption: Relayer.FeeOption) {
    if (sharedDeferred && sharedPendingConfirmation?.id === id) {
      sharedDeferred.resolve({ id, feeOption, confirmed: true })
      sharedDeferred = undefined
      notifyListeners(undefined)
    }
  }

  /**
   * Rejects the current fee option confirmation
   * @param id - The fee confirmation ID to reject
   */
  function rejectPendingFeeOption(id: string) {
    if (sharedDeferred && sharedPendingConfirmation?.id === id) {
      sharedDeferred.resolve({ id, feeOption: undefined, confirmed: false })
      sharedDeferred = undefined
      notifyListeners(undefined)
    }
  }

  useEffect(() => {
    listeners.push(setPendingFeeOptionConfirmation)
    setPendingFeeOptionConfirmation(sharedPendingConfirmation)

    return () => {
      listeners = listeners.filter(l => l !== setPendingFeeOptionConfirmation)
    }
  }, [])

  useEffect(() => {
    if (!v3Connector) {
      return
    }

    const v3Provider = (v3Connector as any).provider
    if (!v3Provider) {
      return
    }

    const originalHandler = v3Provider.feeConfirmationHandler

    v3Provider.feeConfirmationHandler = {
      async confirmFeeOption(
        id: string,
        options: Relayer.FeeOption[],
        txs: TransactionRequest[],
        chainId: number
      ): Promise<{ id: string; feeOption?: Relayer.FeeOption; confirmed: boolean }> {
        const pending = new Deferred<{ id: string; feeOption?: Relayer.FeeOption; confirmed: boolean }>()
        sharedDeferred = pending

        sharedPendingConfirmation = { id, options, chainId }
        notifyListeners(sharedPendingConfirmation)

        return pending.promise
      }
    }

    return () => {
      v3Provider.feeConfirmationHandler = originalHandler
    }
  }, [v3Connector])

  return [pendingFeeOptionConfirmation, confirmPendingFeeOption, rejectPendingFeeOption]
}
