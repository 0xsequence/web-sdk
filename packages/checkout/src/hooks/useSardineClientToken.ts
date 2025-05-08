import { useQuery } from '@tanstack/react-query'

import { fetchSardineClientToken, type FetchSardineClientTokenArgs } from '../api/data.js'

export const useSardineClientToken = (args: FetchSardineClientTokenArgs, disabled?: boolean) => {
  return useQuery({
    queryKey: ['useSardineClientToken', args],
    queryFn: async () => {
      const res = await fetchSardineClientToken(args)

      return res
    },
    retry: false,
    staleTime: 0,
    enabled: !disabled,
    refetchOnWindowFocus: false
  })
}
