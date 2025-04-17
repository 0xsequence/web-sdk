import { useQuery } from '@tanstack/react-query'

import { createFortePaymentIntent, CreateFortePaymentIntentArgs } from '../api/data'

export const useFortePaymentIntent = (args: CreateFortePaymentIntentArgs) => {
  return useQuery({
    queryKey: ['useFortePaymentIntent', args],
    queryFn: async () => {
      const res = await createFortePaymentIntent(args)

      return res
    },
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false
  })
}
