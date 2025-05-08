import { useConfig, useProjectAccessKey } from '@0xsequence/connect'
import { useQuery } from '@tanstack/react-query'

import { checkSardineWhitelistStatus, type CheckSardineWhitelistStatusArgs } from '../utils'

export const useCheckoutWhitelistStatus = (args: CheckSardineWhitelistStatusArgs, disabled?: boolean) => {
  const projectAccessKey = useProjectAccessKey()
  const { env } = useConfig()
  return useQuery({
    queryKey: ['useCheckoutWhitelistStatus', args],
    queryFn: async () => {
      const res = await checkSardineWhitelistStatus(args, projectAccessKey, env.apiUrl)

      return res
    },
    retry: false,
    staleTime: 1800 * 1000,
    enabled: !disabled
  })
}
