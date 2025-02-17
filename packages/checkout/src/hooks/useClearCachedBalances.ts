import { QUERY_KEYS } from '@0xsequence/kit'
import { useQueryClient } from '@tanstack/react-query'

interface UseClearCachedBalances {
  clearCachedBalances: () => void
}

/* deprecated use kit-hooks instead */
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
