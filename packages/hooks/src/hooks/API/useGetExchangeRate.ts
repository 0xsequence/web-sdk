import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import type { HooksOptions } from '../../types'

import { useAPIClient } from './useAPIClient'

/**
 * Hook to fetch current exchange rates from USD to other currencies.
 *
 * This hook uses React Query to fetch and cache exchange rates from the Sequence API.
 * Rates are automatically refreshed every 10 minutes to ensure they stay current.
 * Used throughout the wallet widget and checkout components to display fiat values
 * for tokens and NFTs.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetExchangeRate} for more detailed documentation.
 *
 * @param toCurrency - The target currency code (e.g., 'EUR', 'GBP', 'JPY').
 *                     If 'USD' is provided, returns 1 as the conversion rate.
 *
 * @param options - Optional configuration options:
 *   - retry: Whether to retry failed requests (defaults to true)
 *   - disabled: Whether to disable the query
 *
 * @returns React Query result object containing:
 *   - data: The exchange rate value from USD to the target currency
 *   - isLoading: Whether the initial request is in progress
 *   - error: Any error that occurred
 *   - isError: Whether an error occurred
 *   - isSuccess: Whether the request was successful
 *
 * @example
 * ```tsx
 * const { data: rate = 1, isLoading } = useGetExchangeRate('EUR')
 *
 * // Convert USD amount to EUR
 * const usdAmount = 100
 * const eurAmount = usdAmount * rate
 *
 * if (isLoading) {
 *   return <div>Loading rates...</div>
 * }
 *
 * console.log(`${usdAmount} USD = ${eurAmount} EUR`)
 * ```
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
