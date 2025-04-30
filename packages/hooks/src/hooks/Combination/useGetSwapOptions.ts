import { GetLifiSwapRoutesArgs, type LifiSwapRoute, LifiToken, SequenceAPIClient } from '@0xsequence/api'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { HooksOptions } from '../../types'
import { useAPIClient } from '../API/useAPIClient'

/**
 * Arguments for the useGetSwapOptions hook
 *
 * @property userAddress - The address of the user's wallet
 * @property toTokenAddress - The address of the currency to buy
 * @property chainId - The chain ID where the swap will occur
 */
export interface UseGetSwapOptionsArgs {
  walletAddress: string
  toTokenAddress: string
  chainId: number
}

const getSwapOptions = async (
  apiClient: SequenceAPIClient,
  args: GetLifiSwapRoutesArgs & { walletAddress: string }
): Promise<LifiToken[]> => {
  if (!args.chainId || !args.toTokenAddress) {
    return []
  }

  const res = await apiClient.getLifiSwapRoutes({
    chainId: args.chainId,
    walletAddress: args.walletAddress,
    toTokenAddress: args.toTokenAddress
  })

  if (res.routes.length === 0) {
    return []
  }

  const promises =
    res?.routes.flatMap((route: LifiSwapRoute) =>
      route?.fromTokens.map(async (token: LifiToken) => {
        return token
      })
    ) || []

  return await Promise.all(promises)
}

export const useGetSwapOptions = (args: UseGetSwapOptionsArgs, options?: HooksOptions) => {
  const apiClient = useAPIClient()

  const enabled = !!args.chainId && !!args.toTokenAddress && !options?.disabled

  return useQuery({
    queryKey: [QUERY_KEYS.useGetSwapOptions, args, options],
    queryFn: () => getSwapOptions(apiClient, args),
    retry: options?.retry ?? true,
    // We must keep a long staletime to avoid the list of quotes being refreshed while the user is doing the transactions
    // Instead, we will invalidate the query manually
    staleTime: time.oneHour,
    enabled
  })
}
