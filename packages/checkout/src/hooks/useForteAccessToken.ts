import { useQuery } from '@tanstack/react-query'

import { fetchForteAccessToken } from '../api/data.js'
import { useEnvironmentContext } from '../contexts/Environment.js'

export const useForteAccessToken = () => {
  const { fortePaymentUrl } = useEnvironmentContext()

  return useQuery({
    queryKey: ['useForteAccessToken'],
    queryFn: async () => {
      const res = await fetchForteAccessToken(fortePaymentUrl)

      return res
    },
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false
  })
}
