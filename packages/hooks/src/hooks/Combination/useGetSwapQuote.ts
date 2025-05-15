import type { GetLifiSwapQuoteArgs } from '@0xsequence/api'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time, ZERO_ADDRESS } from '../../constants.js'
import type { HooksOptions } from '../../types/hooks.js'
import { compareAddress } from '../../utils/helpers.js'
import { useAPIClient } from '../API/useAPIClient.js'

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
 * - params: The parameters for the swap quote query
 *   - walletAddress: The address of the user's wallet
 *   - fromTokenAddress: The address of the currency to sell
 *   - toTokenAddress: The address of the currency to buy
 *   - fromTokenAmount?: The amount of currency to sell (optional)
 *   - toTokenAmount?: The amount of currency to buy (optional)
 *   - includeApprove: Whether to include approval data for ERC20 tokens
 *   - slippageBps: The slippage percentage for the swap
 *
 * @param options - Optional configuration for the hook behavior:
 * - disabled: Whether to disable the query
 * - retry: Whether to retry failed queries
 * - Other standard React Query options
 *
 * @returns A React Query result object containing:
 * - data: The swap quote data including:
 *   - quote: The swap quote data including:
 *     - currencyAddress: The address of the currency being   swapped
 *     - currencyBalance: The user's balance of the currency
 *     - price: The price for the swap
 *     - maxPrice: The maximum price (including slippage)
 *     - to: The target contract address for the swap
 *     - transactionData: The calldata for the swap transaction
 *     - transactionValue: The value to send with the transaction (for native tokens)
 *     - approveData: The approval transaction data (if needed)
 *     - amount: The amount of currency to buy
 *     - amountMin: The minimum amount of currency to buy
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
 *     params: {
 *       walletAddress: '0x123...',
 *       fromTokenAddress: '0x456...',
 *       toTokenAddress: '0x789...',
 *       fromTokenAmount: '1000000000000000000', // 1 token in base units
 *       includeApprove: true,
 *       slippageBps: 100,
 *       chainId: 1
 *     }
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
export const useGetSwapQuote = (getSwapQuoteArgs: GetLifiSwapQuoteArgs, options?: HooksOptions) => {
  const apiClient = useAPIClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetSwapQuote, getSwapQuoteArgs, options],
    queryFn: async () => {
      const res = await apiClient.getLifiSwapQuote({
        params: {
          ...getSwapQuoteArgs.params,
          toTokenAddress: compareAddress(getSwapQuoteArgs.params.toTokenAddress, ZERO_ADDRESS)
            ? ZERO_ADDRESS
            : getSwapQuoteArgs.params.toTokenAddress,
          fromTokenAddress: compareAddress(getSwapQuoteArgs.params.fromTokenAddress, ZERO_ADDRESS)
            ? ZERO_ADDRESS
            : getSwapQuoteArgs.params.fromTokenAddress
        }
      })

      return {
        ...res.quote,
        currencyAddress: compareAddress(res.quote.currencyAddress, ZERO_ADDRESS) ? ZERO_ADDRESS : res.quote.currencyAddress
      }
    },
    retry: options?.retry ?? false,
    staleTime: time.oneMinute * 1,
    enabled:
      !options?.disabled &&
      !!getSwapQuoteArgs.params.walletAddress &&
      !!getSwapQuoteArgs.params.fromTokenAddress &&
      !!getSwapQuoteArgs.params.toTokenAddress &&
      getSwapQuoteArgs.params.fromTokenAmount !== '0' &&
      !!getSwapQuoteArgs.params.chainId &&
      !!getSwapQuoteArgs.params.includeApprove
  })
}
