import { SequenceIndexer, Transaction } from '@0xsequence/indexer'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { HooksOptions } from '../../types'

import { useIndexerClients } from './/useIndexerClient'

export interface GetTransactionHistorySummaryArgs {
  accountAddress: string
  chainIds: number[]
}

const getTransactionHistorySummary = async (
  indexerClients: Map<number, SequenceIndexer>,
  { accountAddress }: GetTransactionHistorySummaryArgs
): Promise<Transaction[]> => {
  const histories = await Promise.all(
    Array.from(indexerClients.values()).map(indexerClient =>
      indexerClient.getTransactionHistory({
        filter: {
          accountAddress
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

  return orderedTransactions
}

/**
 * @description Gets the exhaustive transaction history for a given accountAddress and list of chainIds
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
      !!getTransactionHistorySummaryArgs.accountAddress &&
      !options?.disabled
  })
}
