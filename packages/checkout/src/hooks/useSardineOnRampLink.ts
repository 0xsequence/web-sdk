import { useQuery } from '@tanstack/react-query'

import { fetchSardineOnRampLink, type SardineLinkOnRampArgs } from '../api/data'

export const useSardineOnRampLink = (args: SardineLinkOnRampArgs, disabled?: boolean) => {
  return useQuery({
    queryKey: ['useSardineOnRampLink', args],
    queryFn: async () => {
      const res = await fetchSardineOnRampLink(args)

      return res
    },
    retry: false,
    staleTime: 0,
    enabled: !disabled,
    refetchOnWindowFocus: false
  })
}
