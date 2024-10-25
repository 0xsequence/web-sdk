import { useTransactionStatusContext } from '../contexts/TransactionStatusModal'

export const useTransactionStatusModal = () => {
  const { openTransactionStatusModal, closeTransactionStatusModal, transactionStatusSettings } = useTransactionStatusContext()

  return { openTransactionStatusModal, closeTransactionStatusModal, transactionStatusSettings }
}