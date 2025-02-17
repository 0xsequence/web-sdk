import { GetSwapQuoteArgs } from '@0xsequence/api'
import { useQuery } from '@tanstack/react-query'

import { NATIVE_TOKEN_ADDRESS_0X_SWAP, QUERY_KEYS, ZERO_ADDRESS, time } from '../../constants'
import { HooksOptions } from '../../types'
import { compareAddress } from '../../utils/helpers'
import { useAPIClient } from '../API/useAPIClient'

/**
 * @description Gets the swap quote for a given currency pair
 */
export const useGetSwapQuote = (getSwapQuoteArgs: GetSwapQuoteArgs, options?: HooksOptions) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetSwapQuote, getSwapQuoteArgs, options],
    queryFn: async () => {
      const res = await apiClient.getSwapQuote({
        ...getSwapQuoteArgs,
        buyCurrencyAddress: compareAddress(getSwapQuoteArgs.buyCurrencyAddress, ZERO_ADDRESS)
          ? NATIVE_TOKEN_ADDRESS_0X_SWAP
          : getSwapQuoteArgs.buyCurrencyAddress,
        sellCurrencyAddress: compareAddress(getSwapQuoteArgs.sellCurrencyAddress, ZERO_ADDRESS)
          ? NATIVE_TOKEN_ADDRESS_0X_SWAP
          : getSwapQuoteArgs.sellCurrencyAddress
      })

      return {
        ...res.swapQuote,
        currencyAddress: compareAddress(res.swapQuote.currencyAddress, NATIVE_TOKEN_ADDRESS_0X_SWAP)
          ? ZERO_ADDRESS
          : res.swapQuote.currencyAddress
      }
    },
    retry: options?.retry ?? true,
    staleTime: time.oneMinute * 1,
    enabled:
      !options?.disabled || !getSwapQuoteArgs.userAddress || !getSwapQuoteArgs.chainId || !getSwapQuoteArgs.buyCurrencyAddress
  })
}
