import { GetSwapQuoteArgs } from '@0xsequence/api'
import { useQuery } from '@tanstack/react-query'

import { NATIVE_TOKEN_ADDRESS_0X_SWAP, QUERY_KEYS, ZERO_ADDRESS, time } from '../../constants'
import { HooksOptions } from '../../types'
import { compareAddress } from '../../utils/helpers'
import { useAPIClient } from '../API/useAPIClient'

/**
 * Hook to fetch a swap quote for exchanging between two currencies.
 *
 * This hook provides functionality to:
 * - Get a quote for swapping between two currencies (native or ERC20)
 * - Fetch necessary approval data for ERC20 tokens
 * - Generate transaction data for executing the swap
 *
 * The hook automatically handles:
 * - Native token address normalization (between 0x0 and 0xEEE...)
 * - Approval data generation for ERC20 tokens when needed
 * - Transaction data generation for the swap
 * - Error handling for failed API calls
 *
 * Go to {@link https://docs.sequence.xyz/sdk/web/hooks/useGetSwapQuote} for more detailed documentation.
 *
 * @param getSwapQuoteArgs - Configuration object for the swap quote query:
 * - userAddress: The address of the user's wallet
 * - buyCurrencyAddress: The address of the currency to buy
 * - sellCurrencyAddress: The address of the currency to sell
 * - buyAmount: The amount of currency to buy (in base units)
 * - chainId: The chain ID where the swap will occur
 * - includeApprove: Whether to include approval data for ERC20 tokens
 *
 * @param options - Optional configuration for the hook behavior:
 * - disabled: Whether to disable the query
 * - retry: Whether to retry failed queries
 * - Other standard React Query options
 *
 * @returns A React Query result object containing:
 * - data: The swap quote data including:
 *   - currencyAddress: The address of the currency being swapped
 *   - currencyBalance: The user's balance of the currency
 *   - price: The price for the swap
 *   - maxPrice: The maximum price (including slippage)
 *   - to: The target contract address for the swap
 *   - transactionData: The calldata for the swap transaction
 *   - transactionValue: The value to send with the transaction (for native tokens)
 *   - approveData: The approval transaction data (if needed)
 * - isLoading: Whether the query is in progress
 * - isError: Whether an error occurred
 * - error: Any error that occurred
 * - Other standard React Query properties
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetSwapQuote} for more detailed documentation.
 *
 * @example
 * ```tsx
 * import { useGetSwapQuote } from '@0xsequence/hooks'
 *
 * function SwapComponent() {
 *   const { data: swapQuote, isLoading } = useGetSwapQuote({
 *     userAddress: '0x123...',
 *     buyCurrencyAddress: '0x456...',
 *     sellCurrencyAddress: '0x789...',
 *     buyAmount: '1000000000000000000', // 1 token in base units
 *     chainId: 1,
 *     includeApprove: true
 *   })
 *
 *   if (isLoading) return <div>Loading...</div>
 *
 *   return (
 *     <div>
 *       <div>Price: {swapQuote?.price}</div>
 *       <div>Max Price: {swapQuote?.maxPrice}</div>
 *       <button onClick={() => executeSwap(swapQuote)}>
 *         Swap Tokens
 *       </button>
 *     </div>
 *   )
 * }
 * ```
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
