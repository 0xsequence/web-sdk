import { IntentResponseAccountList, SequenceWaaS } from '@0xsequence/waas'
import { useQuery } from '@tanstack/react-query'
import { useConnections } from 'wagmi'

interface UseListAccountsResult {
  /** The accounts data if available */
  data?: IntentResponseAccountList
  /** Whether the query is currently loading */
  isLoading: boolean
  /** Any error that occurred during the query */
  error: Error | null
  /** Function to manually refetch the accounts */
  refetch: () => Promise<void>
}

/**
 * Hook to list all accounts associated with the current WaaS session.
 * Uses React Query for proper async state management.
 *
 * @returns {UseListAccountsResult} Object containing the accounts data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * function AccountsList() {
 *   const { data, isLoading, error, refetch } = useListAccounts()
 *
 *   if (isLoading) return <div>Loading accounts...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <div>
 *       <button onClick={() => refetch()}>Refresh Accounts</button>
 *       {data?.accounts.map(account => (
 *         <div key={account.id}>{account.address}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export const useListAccounts = (): UseListAccountsResult => {
  const connections = useConnections()

  const {
    data,
    isLoading,
    error,
    refetch: reactQueryRefetch
  } = useQuery({
    queryKey: ['waas', 'listAccounts'],
    queryFn: async () => {
      const waasConnection = connections.find(c => c.connector.id.includes('waas'))
      if (!waasConnection) {
        throw new Error('No WaaS connector found')
      }

      const sequenceWaas = (waasConnection.connector as any).sequenceWaas as SequenceWaaS
      if (!sequenceWaas) {
        throw new Error('WaaS instance not properly initialized')
      }

      return await sequenceWaas.listAccounts()
    },
    // Only run the query if we have connections
    enabled: connections.length > 0,
    // Cache the results for 1 minute
    staleTime: 60 * 1000
  })

  const refetch = async () => {
    await reactQueryRefetch()
  }

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch
  }
}
