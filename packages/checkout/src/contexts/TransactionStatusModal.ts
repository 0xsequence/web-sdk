import { Hex } from 'viem'

import { createGenericContext } from './genericContext'

interface Item {
  tokenId: string
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
  txHash: string
}

type TransactionStatusContext = {
  openTransactionStatusModal: (settings: TransactionStatusSettings) => void
  closeTransactionStatusModal: () => void
  transactionStatusSettings?: TransactionStatusSettings
}

export const [useTransactionStatusContext, TransactionStatusModalContextProvider] = createGenericContext<TransactionStatusContext>()
