import { createGenericContext } from './genericContext.js'

interface Item {
  tokenId?: string
  quantity: string
  decimals?: number
  price: string
}

export interface TransactionStatusSettings {
  collectionAddress?: string
  currencyAddress?: string
  chainId: number
  items?: Item[]
  blockConfirmations?: number
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  onClose?: () => void
  txHash: string
}

type TransactionStatusContext = {
  openTransactionStatusModal: (settings: TransactionStatusSettings) => void
  closeTransactionStatusModal: () => void
  transactionStatusSettings?: TransactionStatusSettings
}

const [useTransactionStatusContext, TransactionStatusModalContextProvider] = createGenericContext<TransactionStatusContext>()

export { TransactionStatusModalContextProvider, useTransactionStatusContext }
