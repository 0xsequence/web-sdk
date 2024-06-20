import { useQuery } from '@tanstack/react-query'

import { FetchSardineClientTokenArgs, fetchSardineClientToken } from '../api/data'

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
  })
}
