import { useWalletModalContext, type WalletOptions } from '../contexts/WalletModal'

/**
 * Return type for the useOpenWalletModal hook.
 *
 * @property {function(isOpen: boolean, options?: WalletOptions): void} setOpenWalletModal - Function to open or close the Wallet modal
 * @property {boolean} openWalletModalState - Current open state of the Wallet modal
 */
type UseOpenWalletModalReturnType = {
  setOpenWalletModal: (isOpen: boolean, options?: WalletOptions) => void
  openWalletModalState: boolean
}

/**
 * Hook to manage the Wallet Widget modal.
 *
 * This hook provides a method to open and close the wallet widget modal, and access its current open state.
 * The Wallet Widget displays your Tokens, Collectibles, Transactions, Settings, multiple connected / linked wallets and also allows
 * to send, receive, buy (on-ramp) and swap tokens.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useOpenWalletModal} for more detailed documentation.
 *
 * @returns An object containing function to control the Wallet modal and its state {@link UseOpenWalletModalReturnType}
 *
 * @example
 * ```tsx
 * import { useOpenWalletModal } from '@0xsequence/wallet-widget'
 *
 * const YourComponent = () => {
 *   // Get the function to open/close the wallet modal
 *   const { setOpenWalletModal } = useOpenWalletModal()
 *
 *   // Function to handle opening the wallet widget modal
 *   const handleViewWallet = () => {
 *     setOpenWalletModal(true) // Open the wallet widget modal
 *   }
 *
 *   return (
 *     <button
 *       onClick={handleViewWallet}
 *       title="Wallet"
 *     >
 *       View your wallet
 *     </button>
 *   )
 * }
 * ```
 */
export const useOpenWalletModal = (): UseOpenWalletModalReturnType => {
  const { setOpenWalletModal, openWalletModalState } = useWalletModalContext()

  return { setOpenWalletModal, openWalletModalState }
}
