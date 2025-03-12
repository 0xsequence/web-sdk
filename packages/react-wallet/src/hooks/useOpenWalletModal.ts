import { useWalletModalContext } from '../contexts/WalletModal'

export const useOpenWalletModal = () => {
  const { setOpenWalletModal, openWalletModalState } = useWalletModalContext()

  return { setOpenWalletModal, openWalletModalState }
}
