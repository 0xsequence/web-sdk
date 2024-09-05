import { useTransferFundsModalContext } from '../contexts/TransferFundsModal'

export const useTransferFundsModal = () => {
  const { openTransferFundsModal, closeTransferFundsModal, transferFundsSettings } = useTransferFundsModalContext()

  return { openTransferFundsModal, closeTransferFundsModal, transferFundsSettings }
}
