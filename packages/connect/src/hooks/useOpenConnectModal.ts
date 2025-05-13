import { useConnectModalContext } from '../contexts/ConnectModal.js'

/**
 * Return type for the useOpenConnectModal hook.
 *
 * @property Function to open or close the Connect modal `setOpenConnectModal`
 * @property Current open state of the Connect modal `openConnectModalState`
 */
type UseOpenConnectModalReturnType = {
  isConnectModalOpen: boolean
  setOpenConnectModal: (isOpen: boolean) => void
  openConnectModalState: boolean
}

/**
 * Hook to manage the Connect modal that allows users to connect their wallets to your application.
 *
 * This hook provides a method to open and close the connect modal, and access its current open state.
 * The Connect modal provides various wallet connection options including Sequence wallet and external wallets.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useOpenConnectModal} for more detailed documentation.
 *
 * @returns An object containing function to control the Connect modal and its state {@link UseOpenConnectModalReturnType}
 *
 * @example
 * ```tsx
 * import { useOpenConnectModal } from '@0xsequence/connect'
 *
 * const YourComponent = () => {
 *   const { setOpenConnectModal, openConnectModalState } = useOpenConnectModal()
 *
 *   const handleConnect = () => {
 *     setOpenConnectModal(true) // Open the connect modal
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={handleConnect}>
 *         Connect Wallet
 *       </button>
 *
 *       {openConnectModalState && (
 *         <div>Connect modal is open!</div>
 *       )}
 *     </>
 *   )
 * }
 * ```
 */
export const useOpenConnectModal = (): UseOpenConnectModalReturnType => {
  const { isConnectModalOpen, setOpenConnectModal, openConnectModalState } = useConnectModalContext()

  return { isConnectModalOpen, setOpenConnectModal, openConnectModalState }
}
