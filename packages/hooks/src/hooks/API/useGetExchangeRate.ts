import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { HooksOptions } from '../../types'

import { useAPIClient } from './useAPIClient'

/**
 * @description Gets the exchange rate from USD to another currency
 */
export const useGetExchangeRate = (toCurrency: string, options?: HooksOptions) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetExchangeRate, toCurrency, options],
    queryFn: async () => {
      if (toCurrency === 'USD') {
        return 1
      }

      const res = await apiClient.getExchangeRate({ toCurrency })

      return res.exchangeRate.value
    },
    retry: options?.retry ?? true,
    staleTime: time.oneMinute * 10,
    enabled: !!toCurrency && !options?.disabled
  })
}
