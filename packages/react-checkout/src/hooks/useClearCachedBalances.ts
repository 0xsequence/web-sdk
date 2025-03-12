import { QUERY_KEYS } from '@0xsequence/react-connect'
import { useQueryClient } from '@tanstack/react-query'

interface UseClearCachedBalances {
  clearCachedBalances: () => void
}

/* deprecated use @0xsequence/react-hooks instead */
export const useClearCachedBalances = (): UseClearCachedBalances => {
  const queryClient = useQueryClient()

  return {
    clearCachedBalances: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.balances]
      })
    }
  }
}
