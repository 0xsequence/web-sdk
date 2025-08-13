import { useSwapModalContext, type SwapModalSettings } from '../contexts/SwapModal.js'

/**
 * Return type for the useSwapModal hook.
 *
 * @property {function(settings: SwapModalSettings): void} openSwapModal - Function to open the Swap modal
 * @property {function(): void} closeSwapModal - Function to close the Swap modal
 * @property {SwapModalSettings|undefined} swapModalSettings - Current settings for the Swap modal
 */
type UseSwapModalReturnType = {
  isSwapModalOpen: boolean
  openSwapModal: (settings: SwapModalSettings) => void
  closeSwapModal: () => void
  swapModalSettings: SwapModalSettings | undefined
}

/**
 * Hook to manage the Swap modal that allows users to swap tokens in their wallet to a target currency.
 *
 * This hook provides methods to open and close the swap modal, and access its current settings.
 * The Swap modal allows users to select tokens from their wallet to swap to a specified target token,
 * with the option to execute additional transactions after the swap completes.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useSwapModal} for more detailed documentation.
 *
 * @returns An object containing functions to control the Swap modal and its state {@link UseSwapModalReturnType}
 *
 * @example
 * ```tsx
 * import { useSwapModal } from '@0xsequence/checkout'
 * import { encodeFunctionData, parseAbi } from 'viem'
 *
 * const YourComponent = () => {
 *   const { openSwapModal } = useSwapModal()
 *
 *   const handleSwap = () => {
 *     // Target token information
 *     const chainId = 137 // Polygon
 *     const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' // USDC on Polygon
 *     const currencyAmount = '20000' // 0.02 USDC (in smallest units)
 *
 *     // Optional: Transaction to execute after swap is completed
 *     const data = encodeFunctionData({
 *       abi: parseAbi(['function demo()']),
 *       functionName: 'demo',
 *       args: []
 *     })
 *
 *     // Open the swap modal
 *     openSwapModal({
 *       onSuccess: () => {
 *         console.log('swap successful!')
 *       },
 *       chainId,
 *       currencyAddress,
 *       currencyAmount,
 *       postSwapTransactions: [
 *         {
 *           to: '0x37470dac8a0255141745906c972e414b1409b470',
 *           data
 *         }
 *       ],
 *       title: 'Swap and Pay',
 *       description: 'Select a token in your wallet to swap to 0.2 USDC.'
 *     })
 *   }
 *
 *   return (
 *     <button onClick={handleSwap}>
 *       Swap
 *     </button>
 *   )
 * }
 * ```
 */
export const useSwapModal = (): UseSwapModalReturnType => {
  const { isSwapModalOpen, openSwapModal, closeSwapModal, swapModalSettings } = useSwapModalContext()

  return { isSwapModalOpen, openSwapModal, closeSwapModal, swapModalSettings }
}
