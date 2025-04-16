import { useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '../constants'

export const useClearCachedBalances = () => {
  const queryClient = useQueryClient()

  return {
    clearCachedBalances: () => {
      queryClient.invalidateQueries({
        queryKey: Object.values(QUERY_KEYS)
      })
    }
  }
}
