import { useConfig } from '@0xsequence/hooks'
import { useQuery } from '@tanstack/react-query'

import { createFortePaymentIntent, type CreateFortePaymentIntentArgs } from '../api/data.js'

interface UseFortePaymentIntentOptions {
  disabled?: boolean
}

export const useFortePaymentIntent = (args: CreateFortePaymentIntentArgs, options?: UseFortePaymentIntentOptions) => {
  const { env, projectAccessKey } = useConfig()
  const apiUrl = env.apiUrl

  return useQuery({
    queryKey: ['useFortePaymentIntent', args],
    queryFn: async () => {
      const res = await createFortePaymentIntent(apiUrl, projectAccessKey, args)

      return res
    },
    retry: false,
    staleTime: 60 * 1000,
    refetchOnMount: 'always',
    enabled: !options?.disabled
  })
}
