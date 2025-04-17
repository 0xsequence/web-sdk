import { useQuery } from '@tanstack/react-query'

import { fetchForteAccessToken } from '../api/data'

export const useForteAccessToken = () => {
  return useQuery({
    queryKey: ['useForteAccessToken'],
    queryFn: async () => {
      const res = await fetchForteAccessToken()

      return res
    },
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false
  })
}
