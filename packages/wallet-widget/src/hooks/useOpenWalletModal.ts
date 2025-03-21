import { useWalletModalContext } from '../contexts/WalletModal'

/**
 * Return type for the useOpenWalletModal hook.
 *
 * @property {function(isOpen: boolean): void} setOpenWalletModal - Function to open or close the Wallet modal
 * @property {boolean} openWalletModalState - Current open state of the Wallet modal
 */
type UseOpenWalletModalReturnType = {
  setOpenWalletModal: (isOpen: boolean) => void
  openWalletModalState: boolean
}

/**
 * Hook to manage the Wallet Inventory modal that allows users to view their tokens and NFTs.
 *
 * This hook provides a method to open and close the wallet inventory modal, and access its current open state.
 * The Wallet modal displays all tokens, NFTs and collectibles present in the connected wallet.
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
 *   // Function to handle opening the wallet inventory
 *   const handleViewInventory = () => {
 *     setOpenWalletModal(true) // Open the wallet modal to view tokens
 *   }
 *
 *   return (
 *     <button
 *       onClick={handleViewInventory}
 *       title="Inventory"
 *     >
 *       View all tokens in your wallet
 *     </button>
 *   )
 * }
 * ```
 */
export const useOpenWalletModal = (): UseOpenWalletModalReturnType => {
  const { setOpenWalletModal, openWalletModalState } = useWalletModalContext()

  return { setOpenWalletModal, openWalletModalState }
}
