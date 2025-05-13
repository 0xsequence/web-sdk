import { useTransactionStatusContext } from '../contexts/TransactionStatusModal.js'

export const useTransactionStatusModal = () => {
  const { openTransactionStatusModal, closeTransactionStatusModal, transactionStatusSettings } = useTransactionStatusContext()

  return { openTransactionStatusModal, closeTransactionStatusModal, transactionStatusSettings }
}
