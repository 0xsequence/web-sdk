import { useQuery } from '@tanstack/react-query'

import { createFortePaymentIntent, type CreateFortePaymentIntentArgs } from '../api/data.js'
import { useEnvironmentContext } from '../contexts/Environment.js'

interface UseFortePaymentIntentOptions {
  disabled?: boolean
}

export const useFortePaymentIntent = (args: CreateFortePaymentIntentArgs, options?: UseFortePaymentIntentOptions) => {
  const { fortePaymentUrl } = useEnvironmentContext()

  return useQuery({
    queryKey: ['useFortePaymentIntent', args],
    queryFn: async () => {
      const res = await createFortePaymentIntent(fortePaymentUrl, args)

      return res
    },
    retry: false,
    staleTime: 60 * 1000,
    refetchOnMount: 'always',
    enabled: !options?.disabled
  })
}
