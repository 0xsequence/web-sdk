import { useProjectAccessKey, useEnvironment } from '@0xsequence/kit'
import { useQuery } from '@tanstack/react-query'

import { checkSardineWhitelistStatus, CheckSardineWhitelistStatusArgs } from '../utils'

export const useCheckoutWhitelistStatus = (args: CheckSardineWhitelistStatusArgs, disabled?: boolean) => {
  const prodProjectAccessKey = useProjectAccessKey()

  const { isEnabledDevSardine, devProjectAccessKey } = useEnvironment()

  const projectAccessKey = isEnabledDevSardine ? devProjectAccessKey : prodProjectAccessKey

  return useQuery({
    queryKey: ['useCheckoutWhitelistStatus', args, projectAccessKey, isEnabledDevSardine],
    queryFn: async () => {
      const res = await checkSardineWhitelistStatus(args, projectAccessKey, isEnabledDevSardine)

      return res
    },
    retry: false,
    staleTime: 1800 * 1000,
    enabled: !disabled
  })
}
