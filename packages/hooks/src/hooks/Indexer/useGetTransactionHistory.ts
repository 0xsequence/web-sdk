import { GetTransactionHistoryReturn, Page, SequenceIndexer } from '@0xsequence/indexer'
import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { HooksOptions } from '../../types'

import { useIndexerClient } from './useIndexerClient'

interface GetTransactionHistoryArgs {
  accountAddress: string
  contractAddress?: string
  tokenId?: string
  page?: Page
}

/**
 * Return type for the useGetTransactionHistory hook.
 * Extends React Query's UseInfiniteQueryResult with transaction history data.
 *
 * @property data - The paginated transaction history data
 * @property data.pages - Array of page results, each containing:
 *   - transactions: Array of transaction objects with:
 *     - txnHash: Transaction hash
 *     - blockNumber: Block number where transaction was mined
 *     - blockHash: Hash of the block
 *     - chainId: Chain ID where transaction occurred
 *     - metaTxnID: Optional meta transaction ID
 *     - transfers: Optional array of transaction transfers
 *     - timestamp: Transaction timestamp
 *   - page: Pagination information:
 *     - page: Next page number
 *     - more: Whether more results exist in the next page
 *     - pageSize: Number of results per page
 * @property everything else that react query returns {@link UseInfiniteQueryResult}
 *
 */
export type UseGetTransactionHistoryReturnType = UseInfiniteQueryResult<InfiniteData<GetTransactionHistoryReturn, unknown>, Error>

export interface UseGetTransactionHistoryArgs extends GetTransactionHistoryArgs {
  chainId: number
}

const getTransactionHistory = async (
  indexerClient: SequenceIndexer,
  { contractAddress, accountAddress, tokenId, page }: GetTransactionHistoryArgs
) => {
  const res = indexerClient.getTransactionHistory({
    includeMetadata: true,
    page,
    filter: {
      accountAddress,
      contractAddress,
      tokenID: tokenId
    }
  })

  return res
}

/**
 * Hook to fetch and paginate through transaction history for a given account and chain.
 *
 * This hook provides methods to fetch transaction history with support for infinite scrolling.
 * It can filter transactions by contract address and token ID, making it useful for both
 * general account history and specific asset history views.
 *
 * Go to {@link https://docs.sequence.xyz/sdk/web/hooks/useGetTransactionHistory} for more detailed documentation.
 *
 * @param args - Configuration object for the transaction history query {@link GetTransactionHistoryArgs}
 *
 * @returns A hook that returns the transaction history for a given account and chain. {@link UseGetTransactionHistoryReturnType}
 *
 * @example
 * ```tsx
 * import { useGetTransactionHistory } from '@0xsequence/hooks'
 *
 * const TransactionList = () => {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *     isLoading,
 *     isFetchingNextPage
 *   } = useGetTransactionHistory({
 *     chainId: 1,
 *     accountAddress: '0x123...',
 *     // Optional filters:
 *     // contractAddress: '0x456...',
 *     // tokenId: '1'
 *   })
 *
 *   if (isLoading) return <div>Loading...</div>
 *
 *   return (
 *     <div>
 *       {data?.pages.map(page =>
 *         page.transactions.map(tx => (
 *           <div key={tx.txnHash}>
 *             Transaction: {tx.txnHash}
 *             Block: {tx.blockNumber}
 *             Time: {tx.timestamp}
 *           </div>
 *         ))
 *       )}
 *
 *       {hasNextPage && (
 *         <button
 *           onClick={() => fetchNextPage()}
 *           disabled={isFetchingNextPage}
 *         >
 *           {isFetchingNextPage ? 'Loading more...' : 'Load more'}
 *         </button>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export const useGetTransactionHistory = (
  args: UseGetTransactionHistoryArgs,
  options?: HooksOptions
): UseGetTransactionHistoryReturnType => {
  const indexerClient = useIndexerClient(args.chainId)

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.useGetTransactionHistory, args, options],
    queryFn: ({ pageParam }) => {
      return getTransactionHistory(indexerClient, {
        ...args,
        page: { page: pageParam }
      })
    },
    getNextPageParam: ({ page }) => {
      // Note: must return undefined instead of null to stop the infinite scroll
      if (!page.more) {
        return undefined
      }

      return page?.page || 1
    },
    initialPageParam: 1,
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.accountAddress && !options?.disabled
  })
}
