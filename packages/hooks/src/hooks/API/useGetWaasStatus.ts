import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { WAAS_STATUS_URL } from '../../constants.js'

export type WaasErrorStatusResponse = {
  status: number
  error: number
  code: string
  msg: string
}

export type WaasSuccessStatusResponse = {
  healthOK: boolean
  pcr0: string
  startTime: string
  uptime: string
  ver: string
}

export type WaasStatusResponse = {
  successResponse: WaasSuccessStatusResponse | undefined
  errorResponse: WaasErrorStatusResponse | undefined
}

/**
 * React hook to fetch the current WAAS (Wallet as a Service) status from the backend API.
 *
 * @returns {UseQueryResult<WaasStatusResponse, Error>} The react-query result object containing:
 *   - data: The WAAS status response
 *     - successResponse: The WAAS status response if the request is successful
 *     - errorResponse: The WAAS status response if the request is not successful
 *   - error: Any error encountered during fetch
 *   - isLoading: Boolean indicating if the request is in progress
 *   - isSuccess, isError, refetch, etc.
 *
 * An error will be thrown only if the endpoint is not reachable or has an unhandled error.
 *
 * @example
 * ```tsx
 * import { useGetWaasStatus } from '@0xsequence/hooks'
 *
 * const MyComponent = () => {
 *   const { data, isLoading, error } = useGetWaasStatus()
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   if (!data) return <div>No status available</div>
 *
 *   return <div>Status: {data.successResponse?.healthOK ? 'OK' : data.errorResponse?.msg}</div>
 * }
 * ```
 */
export const useGetWaasStatus = (): UseQueryResult<WaasStatusResponse, Error> => {
  return useQuery({
    queryKey: ['waasStatus'],
    queryFn: async () => {
      const res = await fetch(WAAS_STATUS_URL)
      const data = await res.json()
      return {
        successResponse: data.healthOK ? (data as WaasSuccessStatusResponse) : undefined,
        errorResponse: data.error ? (data as WaasErrorStatusResponse) : undefined
      }
    },
    retry: false
  })
}
