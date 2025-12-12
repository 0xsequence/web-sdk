import { useTransferFundsModalContext } from '../contexts/TransferFundsModal.js'

export const useTransferFundsModal = () => {
  const { openTransferFundsModal, closeTransferFundsModal, transferFundsSettings } = useTransferFundsModalContext()

  return { openTransferFundsModal, closeTransferFundsModal, transferFundsSettings }
}
