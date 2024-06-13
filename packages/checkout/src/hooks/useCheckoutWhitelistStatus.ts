import { useProjectAccessKey } from '@0xsequence/kit'
import { useQuery } from '@tanstack/react-query'

import { checkSardineWhitelistStatus, CheckSardineWhitelistStatusArgs } from '../utils'


export const useCheckoutWhitelistStatus = (args: CheckSardineWhitelistStatusArgs, disabled?: boolean) => {
  const projectAccessKey = useProjectAccessKey()

  return useQuery({
    queryKey: ['useCheckoutWhitelistStatus', args],
    queryFn: async () => {
      const res = await checkSardineWhitelistStatus(args, projectAccessKey)

      return res
    },
    retry: false,
    staleTime: 1800 * 1000,
    enabled: !disabled
  })
}
