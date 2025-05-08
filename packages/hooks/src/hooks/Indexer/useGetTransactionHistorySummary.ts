import type { SequenceIndexer, Transaction } from '@0xsequence/indexer'
import { useQuery } from '@tanstack/react-query'
import { getAddress } from 'viem'

import { QUERY_KEYS, time } from '../../constants.js'
import type { HooksOptions } from '../../types/hooks.js'

import { useIndexerClients } from './useIndexerClient.js'

export interface GetTransactionHistorySummaryArgs {
  accountAddresses: string[]
  chainIds: number[]
}

const getTransactionHistorySummary = async (
  indexerClients: Map<number, SequenceIndexer>,
  { accountAddresses }: GetTransactionHistorySummaryArgs
): Promise<Transaction[]> => {
  const histories = await Promise.all(
    Array.from(indexerClients.values()).map(indexerClient =>
      indexerClient.getTransactionHistory({
        filter: {
          accountAddresses
        },
        includeMetadata: true
      })
    )
  )

  const unorderedTransactions = histories.map(history => history.transactions).flat()
  const orderedTransactions = unorderedTransactions.sort((a, b) => {
    const firstDate = new Date(a.timestamp).getTime()
    const secondDate = new Date(b.timestamp).getTime()
    return secondDate - firstDate
  })

  const transactions = orderedTransactions.map(transaction => ({
    ...transaction,
    transfers: transaction.transfers?.map(transfer => ({
      ...transfer,
      from: getAddress(transfer.from),
      to: getAddress(transfer.to)
    }))
  }))

  return transactions
}

/**
 * A hook that retrieves a comprehensive transaction history summary across multiple chains for a given account address.
 * The transactions are ordered by timestamp (newest first) and include detailed transfer information.
 *
 * Implementation details:
 * - Uses Promise.all with an array of indexer clients to fetch transactions from all specified chains in parallel
 * - Flattens and sorts the combined results by timestamp
 * - Normalizes all addresses in transfer objects using viem's getAddress
 *
 * @param getTransactionHistorySummaryArgs - Configuration object for the transaction history query
 * @param getTransactionHistorySummaryArgs.accountAddress - The account address to fetch transactions for
 * @param getTransactionHistorySummaryArgs.chainIds - Array of chain IDs to fetch transactions from. Each chain ID will be queried in parallel.
 * @param options - Optional configuration for the hook behavior
 * @param options.disabled - If true, disables the query
 * @param options.retry - If true (default), retries failed requests
 *
 * @returns A React Query result object containing:
 * - data: Array of Transaction objects combined from all specified chains, each containing:
 *   - txnHash: Transaction hash
 *   - chainId: Chain ID where transaction occurred
 *   - timestamp: Transaction timestamp
 *   - transfers: Array of transfer objects with normalized addresses
 *   - blockNumber: Block number where transaction was mined
 *   - blockHash: Hash of the block
 *   - metaTxnID: Optional meta transaction ID
 * - Other standard React Query properties (isLoading, isError, etc.)
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetTransactionHistorySummary} for more detailed documentation.
 *
 * @example
 * ```tsx
 * import { useGetTransactionHistorySummary } from '@0xsequence/hooks'
 * import { useAccount } from 'wagmi'
 *
 * // Basic usage in a component
 * const TransactionHistory = () => {
 *   const { address: accountAddress } = useAccount()
 *   const {
 *     data: transactionHistory = [],
 *     isLoading: isLoadingTransactionHistory
 *   } = useGetTransactionHistorySummary({
 *     accountAddress: accountAddress || '',
 *     chainIds: [1, 137]
 *   })
 *
 *   return (
 *     <div>
 *       {transactionHistory.map(tx => (
 *         <div key={tx.txnHash}>
 *           Transaction: {tx.txnHash}
 *           Chain: {tx.chainId}
 *           Time: {tx.timestamp}
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 *
 * @remarks
 * - The hook uses the Sequence Indexer service to fetch transaction data
 * - Creates a separate indexer client for each chain ID and fetches from all in parallel
 * - Transactions from all chains are combined and sorted by timestamp (newest first)
 * - All addresses in transfer objects are normalized using viem's getAddress
 * - The query is enabled only when chainIds array is not empty and accountAddress is provided
 * - The query result is cached for 30 seconds (staleTime)
 * - The query automatically refetches when the component is mounted
 */
export const useGetTransactionHistorySummary = (
  getTransactionHistorySummaryArgs: GetTransactionHistorySummaryArgs,
  options?: HooksOptions
) => {
  const indexerClients = useIndexerClients(getTransactionHistorySummaryArgs.chainIds)

  return useQuery({
    queryKey: [QUERY_KEYS.useGetTransactionHistorySummary, getTransactionHistorySummaryArgs, options],
    queryFn: async () => {
      return await getTransactionHistorySummary(indexerClients, getTransactionHistorySummaryArgs)
    },
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    refetchOnMount: true,
    enabled:
      getTransactionHistorySummaryArgs.chainIds.length > 0 &&
      getTransactionHistorySummaryArgs.accountAddresses.length > 0 &&
      !options?.disabled
  })
}
