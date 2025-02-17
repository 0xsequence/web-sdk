import { SequenceAPIClient, Token } from '@0xsequence/api'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { HooksOptions } from '../../types'

import { useAPIClient } from './useAPIClient'

const getCoinPrices = async (apiClient: SequenceAPIClient, tokens: Token[]) => {
  if (tokens.length === 0) {
    return []
  }

  const res = await apiClient.getCoinPrices({ tokens })

  return res?.tokenPrices || []
}

/**
 * @description Gets the prices of a list of tokens
 */
export const useGetCoinPrices = (tokens: Token[], options?: HooksOptions) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetCoinPrices, tokens, options],
    queryFn: () => getCoinPrices(apiClient, tokens),
    retry: options?.retry ?? true,
    staleTime: time.oneMinute,
    enabled: tokens.length > 0 && !options?.disabled
  })
}
