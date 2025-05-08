import { useAddFundsModalContext, type AddFundsSettings } from '../contexts/AddFundsModal'

/**
 * Return type for the useAddFundsModal hook.
 *
 * @property Function to open the On-ramp modal `triggerAddFunds`
 * @property Function to close the On-ramp modal `closeAddFunds`
 * @property Current settings for the On-ramp modal `addFundsSettings`
 */
type UseAddFundsModalReturnType = {
  isAddFundsModalOpen: boolean
  triggerAddFunds: (settings: AddFundsSettings) => void
  closeAddFunds: () => void
  addFundsSettings: AddFundsSettings | undefined
}

/**
 * Hook to manage the On-ramp modal that allows users to buy cryptocurrency with a credit/debit card.
 *
 * This hook provides methods to open and close the modal, and access its current settings.
 * The modal integration is powered by Transak, allowing users to purchase crypto directly within
 * your application.
 *
 * Go to {@link https://docs.sequence.xyz/sdk/web/hooks/useAddFundsModal} for more detailed documentation.
 *
 * @returns An object containing functions and settings for the On-ramp modal {@link UseAddFundsModalReturnType}
 *
 * @example
 * ```tsx
 * import { useAddFundsModal } from '@0xsequence/checkout'
 *
 * const YourComponent = () => {
 *   const { triggerAddFunds } = useAddFundsModal()
 *   const walletAddress = '0x123...' // User's wallet address
 *
 *   const handleAddFunds = () => {
 *     triggerAddFunds({
 *       walletAddress,
 *       defaultFiatAmount: '50',
 *       defaultCryptoCurrency: 'USDC',
 *       onOrderSuccessful: (data) => {
 *         console.log('Order successful!', data)
 *       }
 *     })
 *   }
 *
 *   return (
 *     <button onClick={handleAddFunds}>
 *       Add Funds
 *     </button>
 *   )
 * }
 * ```
 */
export const useAddFundsModal = (): UseAddFundsModalReturnType => {
  const { isAddFundsModalOpen, triggerAddFunds, closeAddFunds, addFundsSettings } = useAddFundsModalContext()

  return { isAddFundsModalOpen, triggerAddFunds, closeAddFunds, addFundsSettings }
}
