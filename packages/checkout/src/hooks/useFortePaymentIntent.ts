import { useConfig } from '@0xsequence/hooks'
import { useQuery } from '@tanstack/react-query'

import { createFortePaymentIntent, type CreateFortePaymentIntentArgs } from '../api/data.js'
import { useEnvironmentContext } from '../contexts/Environment.js'

interface UseFortePaymentIntentOptions {
  disabled?: boolean
}

export const useFortePaymentIntent = (args: CreateFortePaymentIntentArgs, options?: UseFortePaymentIntentOptions) => {
  // const { env } = useConfig()
  // const apiUrl = env.apiUrl
  // const { fortePaymentUrl } = useEnvironmentContext()

  const apiUrl = 'http://localhost:4422'

  return useQuery({
    queryKey: ['useFortePaymentIntent', args],
    queryFn: async () => {
      const res = await createFortePaymentIntent(apiUrl, args)

      return res
    },
    retry: false,
    staleTime: 60 * 1000,
    refetchOnMount: 'always',
    enabled: !options?.disabled
  })
}
