import { SequenceAPIClient, Token } from '@0xsequence/api'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { HooksOptions } from '../../types'

import { useAPIClient } from './useAPIClient'

const getCollectiblePrices = async (apiClient: SequenceAPIClient, tokens: Token[]) => {
  if (tokens.length === 0) {
    return []
  }

  const res = await apiClient.getCollectiblePrices({ tokens })

  return res?.tokenPrices || []
}

/**
 * @description Gets the prices of a list of collectibles
 */
export const useGetCollectiblePrices = (tokens: Token[], options?: HooksOptions) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetCollectiblePrices, tokens, options],
    queryFn: () => getCollectiblePrices(apiClient, tokens),
    retry: options?.retry ?? true,
    staleTime: time.oneMinute,
    enabled: tokens.length > 0 && !options?.disabled
  })
}
