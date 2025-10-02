'use client'

import type { Relayer } from '@0xsequence/dapp-client'
import { useIndexerClient } from '@0xsequence/hooks'
import { ContractVerificationStatus } from '@0xsequence/indexer'
import { useEffect, useState } from 'react'
import { formatUnits, zeroAddress } from 'viem'
import type { TransactionRequest } from 'viem'
import type { Connector } from 'wagmi'
import { useConnections } from 'wagmi'

import { Deferred } from '../utils/deferred.js'

// --- Shared State Management ---
let sharedPendingConfirmation: FeeOptionConfirmation | undefined = undefined
let sharedDeferred: Deferred<{ id: string; feeOption?: Relayer.FeeOption; confirmed: boolean }> | undefined = undefined
let listeners: React.Dispatch<React.SetStateAction<FeeOptionConfirmation | undefined>>[] = []

const notifyListeners = (state: FeeOptionConfirmation | undefined) => {
  sharedPendingConfirmation = state
  listeners.forEach(listener => listener(state))
}

/**
 * Extended FeeOption type that includes balance information
 */
export type FeeOptionExtended = Relayer.FeeOption & {
  /** Raw balance string */
  balance: string
  /** Formatted balance with proper decimals */
  balanceFormatted: string
  /** Indicates if the wallet has enough balance to pay the fee */
  hasEnoughBalanceForFee: boolean
}

/**
 * Fee option confirmation data structure
 */
export type FeeOptionConfirmation = {
  /** Unique identifier for the fee confirmation */
  id: string
  /** Available fee options, possibly with balance information */
  options: Relayer.FeeOption[] | FeeOptionExtended[]
  /** Chain ID where the transaction will be executed */
  chainId: number
}

/**
 * Return type for the useFeeOptions hook
 */
export type UseFeeOptionsReturnType = [
  pendingFeeOptionConfirmation: FeeOptionConfirmation | undefined,
  confirmPendingFeeOption: (id: string, feeTokenAddress: string) => void,
  rejectPendingFeeOption: (id: string) => void
]

/**
 * Options for the useFeeOptions hook
 *
 * @property {boolean} skipFeeBalanceCheck - Whether to skip checking token balances (default: false)
 */
export interface FeeOptionsConfig {
  /** Whether to skip checking token balances (default: false) */
  skipFeeBalanceCheck?: boolean
}

/**
 * Hook for handling Sequence V3 fee options for unsponsored transactions
 *
 * This hook provides functionality to:
 * - Intercept fee options for a transaction.
 * - Provide user wallet balances for each fee option.
 * - Allow the user to select a fee option via a UI component.
 * - Confirm or reject the fee selection.
 *
 * @param config - Configuration options for the hook {@link FeeOptionsConfig}
 * @returns Array containing the confirmation state and control functions {@link UseFeeOptionsReturnType}
 *
 * @example
 * ```tsx
 *   // Use the hook with default balance checking
 *   const [
 *     pendingFeeOption,
 *     confirmFeeOption,
 *     rejectFeeOption
 *   ] = useFeeOptions();
 *
 *   // Or skip balance checking
 *   // const [pendingFeeOption, confirmFeeOption, rejectFeeOption] =
 *   //   useFeeOptions({ skipFeeBalanceCheck: true });
 *
 *   if (pendingFeeOption) {
 *     // Render a modal to select a fee from `pendingFeeOption.options`
 *     // On select, call `confirmFeeOption(pendingFeeOption.id, selectedOption.token.contractAddress)`
 *     // On close/reject, call `rejectFeeOption(pendingFeeOption.id)`
 *   }
 * ```
 */
export function useFeeOptions(config?: FeeOptionsConfig): UseFeeOptionsReturnType {
  const { skipFeeBalanceCheck = false } = config || {}
  const connections = useConnections()
  const v3Connector: Connector | undefined = connections.find((c: any) =>
    c.connector.id.includes('sequence-v3-wallet')
  )?.connector

  const [pendingFeeOptionConfirmation, setPendingFeeOptionConfirmation] = useState<FeeOptionConfirmation | undefined>(
    sharedPendingConfirmation
  )

  const indexerClient = useIndexerClient(connections[0]?.chainId ?? 1)

  /**
   * Confirms the selected fee option
   * @param id - The fee confirmation ID
   * @param feeTokenAddress - The contract address of the token to use for fee payment
   */
  function confirmPendingFeeOption(id: string, feeTokenAddress: string) {
    if (sharedDeferred && sharedPendingConfirmation?.id === id) {
      const feeOption = sharedPendingConfirmation.options.find((option: any) => option.token.contractAddress === feeTokenAddress)

      if (feeOption) {
        sharedDeferred.resolve({ id, feeOption, confirmed: true })
      } else {
        console.error(`[useFeeOptions] Fee option with token address ${feeTokenAddress} not found. Rejecting.`)
        sharedDeferred.resolve({ id, feeOption: undefined, confirmed: false })
      }

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
        notifyListeners(undefined)

        const accountAddress = connections[0]?.accounts[0]
        if (!accountAddress) {
          throw new Error('No account address available')
        }

        if (!skipFeeBalanceCheck) {
          const optionsWithBalances = await Promise.all(
            options.map(async (option: any) => {
              if (option.token.contractAddress !== zeroAddress) {
                const tokenBalances = await indexerClient.getTokenBalancesByContract({
                  filter: {
                    accountAddresses: [accountAddress],
                    contractStatus: ContractVerificationStatus.ALL,
                    contractAddresses: [option.token.contractAddress]
                  },
                  omitMetadata: true
                })
                const tokenBalance = tokenBalances.balances[0]?.balance
                return {
                  ...option,
                  balanceFormatted: option.token.decimals
                    ? formatUnits(BigInt(tokenBalances.balances[0]?.balance ?? '0'), option.token.decimals)
                    : (tokenBalances.balances[0]?.balance ?? '0'),
                  balance: tokenBalances.balances[0]?.balance ?? '0',
                  hasEnoughBalanceForFee: tokenBalance ? BigInt(option.value) <= BigInt(tokenBalance) : false
                }
              }
              const nativeBalance = await indexerClient.getNativeTokenBalance({ accountAddress })
              return {
                ...option,
                balanceFormatted: formatUnits(BigInt(nativeBalance.balance.balance), 18),
                balance: nativeBalance.balance.balance,
                hasEnoughBalanceForFee: BigInt(option.value) <= BigInt(nativeBalance.balance.balance)
              }
            })
          )
          notifyListeners({ id, options: optionsWithBalances, chainId })
        } else {
          notifyListeners({ id, options, chainId })
        }
        return pending.promise
      }
    }

    return () => {
      v3Provider.feeConfirmationHandler = originalHandler
    }
  }, [v3Connector, indexerClient, skipFeeBalanceCheck, connections])

  return [pendingFeeOptionConfirmation, confirmPendingFeeOption, rejectPendingFeeOption]
}
