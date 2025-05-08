'use client'

import type { FeeOption, Transaction } from '@0xsequence/waas'
import { useConnections } from 'wagmi'

/**
 * Hook for checking transaction fee options in Sequence WaaS (Wallet as a Service)
 *
 * This hook provides functionality to:
 * - Check if a transaction will be sponsored
 * - Get available fee options for unsponsored transactions
 * - Retrieve fee quotes for transactions
 *
 * The hook is commonly used in conjunction with `useWaasFeeOptions` to handle fee payments
 * for unsponsored transactions. It's particularly useful in
 * wallet interfaces and transaction confirmation flows.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useCheckWaasFeeOptions} for more detailed documentation.
 *
 * @returns A function that accepts transaction details and returns fee information
 * @returns.feeQuote - The fee quote for the transaction if available
 * @returns.feeOptions - Available fee payment options if the transaction is not sponsored
 * @returns.isSponsored - Whether the transaction is sponsored (true) or requires fee payment (false)
 *
 * @example
 * ```tsx
 * import { useCheckWaasFeeOptions } from '@0xsequence/connect'
 *
 * const YourComponent = () => {
 *   const checkFeeOptions = useCheckWaasFeeOptions()
 *
 *   const handleTransaction = async () => {
 *     const { isSponsored, feeOptions, feeQuote } = await checkFeeOptions({
 *       transactions: [transaction],
 *       chainId: 1 // Ethereum Mainnet
 *     })
 *
 *     if (!isSponsored && feeOptions) {
 *       // Handle fee options for unsponsored transaction
 *       console.log('Available fee options:', feeOptions)
 *       console.log('Fee quote:', feeQuote)
 *     }
 *   }
 * }
 * ```
 */
export function useCheckWaasFeeOptions(): (params: { transactions: Transaction[]; chainId: number }) => Promise<{
  feeQuote: string | undefined
  feeOptions: FeeOption[] | undefined
  isSponsored: boolean
}> {
  const connections = useConnections()
  const waasConnector = connections.find(c => c.connector.id.includes('waas'))?.connector

  return async ({ transactions, chainId }) => {
    if (!waasConnector) {
      return {
        feeQuote: undefined,
        feeOptions: undefined,
        isSponsored: true
      }
    }

    const waasProvider = (waasConnector as any).sequenceWaasProvider
    if (!waasProvider) {
      return {
        feeQuote: undefined,
        feeOptions: undefined,
        isSponsored: true
      }
    }

    return waasProvider.checkTransactionFeeOptions({ transactions, chainId })
  }
}
