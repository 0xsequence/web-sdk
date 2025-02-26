import { useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@0xsequence/kit'

interface UseClearCachedBalances {
  clearCachedBalances: () => void
}

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
