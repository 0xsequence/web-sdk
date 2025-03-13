'use client'

import { ContractVerificationStatus } from '@0xsequence/indexer'
import type { FeeOption } from '@0xsequence/waas'
import { formatUnits, type ethers } from 'ethers'
import { useState, useEffect, useRef } from 'react'
import type { Connector } from 'wagmi'
import { useConnections } from 'wagmi'

import { Deferred } from '../utils/deferred'

import { useIndexerClient } from './useIndexerClient'

/**
 * Extended FeeOption type that includes balance information
 */
export type FeeOptionExtended = FeeOption & {
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
export type WaasFeeOptionConfirmation = {
  /** Unique identifier for the fee confirmation */
  id: string
  /** Available fee options with balance information */
  options: FeeOptionExtended[] | FeeOption[]
  /** Chain ID where the transaction will be executed */
  chainId: number
}

/**
 * Return type for the useWaasFeeOptions hook
 */
export type UseWaasFeeOptionsReturn = [
  pendingFeeOptionConfirmation: WaasFeeOptionConfirmation | undefined,
  confirmPendingFeeOption: (id: string, feeTokenAddress: string | null) => void,
  rejectPendingFeeOption: (id: string) => void
]

/**
 * Hook for handling WaaS (Wallet as a Service) fee options for unsponsored transactions
 *
 * This hook provides functionality to:
 * - Get available fee options for a transaction in Native Token and ERC20's
 * - Check wallet balances for each fee option
 * - Confirm or reject fee selections
 *
 * @param chainId - The chain ID for which to get fee options
 * @returns {UseWaasFeeOptionsReturn} Array containing the confirmation state and control functions
 *
 * @example
 * ```tsx
 *   const chainId = 137 // Polygon mainnet
 *   const [
 *     pendingFeeOptionConfirmation,
 *     confirmPendingFeeOption,
 *     rejectPendingFeeOption
 *   ] = useWaasFeeOptions(chainId);
 *
 *   const [selectedFeeOptionTokenName, setSelectedFeeOptionTokenName] = useState<string>();
 *   const [feeOptionAlert, setFeeOptionAlert] = useState<AlertProps>();
 *
 *   // Initialize with first option when fee options become available
 *   useEffect(() => {
 *     if (pendingFeeOptionConfirmation) {
 *       console.log('Pending fee options: ', pendingFeeOptionConfirmation.options)
 *     }
 *   }, [pendingFeeOptionConfirmation]);
 *
 * ```
 */
export function useWaasFeeOptions(skipFeeBalanceCheck = false): UseWaasFeeOptionsReturn {
  const connections = useConnections()
  const waasConnector: Connector | undefined = connections.find(c => c.connector.id.includes('waas'))?.connector
  const [pendingFeeOptionConfirmation, setPendingFeeOptionConfirmation] = useState<WaasFeeOptionConfirmation | undefined>()
  const pendingConfirmationRef = useRef<
    Deferred<{ id: string; feeTokenAddress?: string | null; confirmed: boolean }> | undefined
  >(undefined)
  const indexerClient = useIndexerClient(connections[0].chainId ?? 1)

  // Reset state when chainId changes
  useEffect(() => {
    setPendingFeeOptionConfirmation(undefined)
    pendingConfirmationRef.current = undefined
  }, [])

  /**
   * Confirms the selected fee option
   * @param id - The fee confirmation ID
   * @param feeTokenAddress - The address of the token to use for fee payment (null for native token)
   */
  function confirmPendingFeeOption(id: string, feeTokenAddress: string | null) {
    if (pendingConfirmationRef.current) {
      pendingConfirmationRef.current.resolve({ id, feeTokenAddress, confirmed: true })
      setPendingFeeOptionConfirmation(undefined)
      pendingConfirmationRef.current = undefined
    }
  }

  /**
   * Rejects the current fee option confirmation
   * @param id - The fee confirmation ID to reject
   */
  function rejectPendingFeeOption(id: string) {
    if (pendingConfirmationRef.current) {
      pendingConfirmationRef.current.resolve({ id, feeTokenAddress: undefined, confirmed: false })
      setPendingFeeOptionConfirmation(undefined)
      pendingConfirmationRef.current = undefined
    }
  }

  useEffect(() => {
    if (!waasConnector) {
      return
    }

    const waasProvider = (waasConnector as any).sequenceWaasProvider
    if (!waasProvider) {
      return
    }

    const originalHandler = waasProvider.feeConfirmationHandler

    waasProvider.feeConfirmationHandler = {
      async confirmFeeOption(
        id: string,
        options: FeeOption[],
        txs: ethers.Transaction[],
        chainId: number
      ): Promise<{ id: string; feeTokenAddress?: string | null; confirmed: boolean }> {
        const pending = new Deferred<{ id: string; feeTokenAddress?: string | null; confirmed: boolean }>()
        pendingConfirmationRef.current = pending
        const accountAddress = connections[0]?.accounts[0]
        if (!accountAddress) {
          throw new Error('No account address available')
        }

        if (!skipFeeBalanceCheck) {
          const optionsWithBalances = await Promise.all(
            options.map(async option => {
              if (option.token.contractAddress) {
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
                    ? formatUnits(tokenBalances.balances[0]?.balance ?? '0', option.token.decimals)
                    : (tokenBalances.balances[0]?.balance ?? '0'),
                  balance: tokenBalances.balances[0]?.balance ?? '0',
                  hasEnoughBalanceForFee: tokenBalance ? BigInt(option.value) <= BigInt(tokenBalance) : false
                }
              }
              const nativeBalance = await indexerClient.getNativeTokenBalance({ accountAddress })
              return {
                ...option,
                balanceFormatted: formatUnits(nativeBalance.balance.balance, 18),
                balance: nativeBalance.balance.balance,
                hasEnoughBalanceForFee: BigInt(option.value) <= BigInt(nativeBalance.balance.balance)
              }
            })
          )
          setPendingFeeOptionConfirmation({ id, options: optionsWithBalances, chainId })
        } else {
          setPendingFeeOptionConfirmation({ id, options, chainId })
        }
        return pending.promise
      }
    }

    return () => {
      waasProvider.feeConfirmationHandler = originalHandler
    }
  }, [waasConnector, indexerClient])

  return [pendingFeeOptionConfirmation, confirmPendingFeeOption, rejectPendingFeeOption]
}
