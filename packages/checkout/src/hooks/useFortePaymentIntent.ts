import { useQuery } from '@tanstack/react-query'

import { createFortePaymentIntent, CreateFortePaymentIntentArgs } from '../api/data'
import { useEnvironmentContext } from '../contexts/Environment'
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
    refetchOnWindowFocus: false,
    enabled: !options?.disabled
  })
}
