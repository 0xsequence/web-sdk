import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants.js'
import type { QueryHookOptions } from '../../types/hooks.js'

import { useAPIClient } from './useAPIClient.js'

/**
 * Hook to fetch current exchange rates from USD to other currencies.
 *
 * This hook uses React Query to fetch and cache exchange rates from the Sequence API.
 * Rates are automatically refreshed every 10 minutes to ensure they stay current.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks-sdk/hooks/useGetExchangeRate} for more detailed documentation.
 *
 * @param toCurrency - The target currency code (e.g., 'EUR', 'GBP', 'JPY').
 *                     If 'USD' is provided, returns 1 as the conversion rate.
 *
 * @param options - React Query options (except queryKey and queryFn which are managed by the hook).
 *   Defaults: retry: false, staleTime: 10 minutes.
 *
 * @example
 * ```tsx
 * const { data: rate = 1, isLoading } = useGetExchangeRate('EUR')
 * ```
 */
export const useGetExchangeRate = (toCurrency: string, options?: QueryHookOptions<number>) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetExchangeRate, toCurrency],
    queryFn: async () => {
      if (toCurrency === 'USD') {
        return 1
      }

      const res = await apiClient.getExchangeRate({ toCurrency })

      return res.exchangeRate.value
    },
    retry: false,
    staleTime: time.oneMinute * 10,
    enabled: !!toCurrency,
    ...options
  })
}
