import { Hex } from 'viem'

import { createGenericContext } from './genericContext'

export type CreditCardProviders = 'sardine' | 'transak'

export interface Collectible {
  tokenId: string
  quantity: string
  decimals?: number
  price?: string
 }

export interface SelectPaymentSettings {
  collectibles: Collectible[]
  chain: number | string
  currencyAddress: string | Hex
  price: string
  targetContractAddress: string | Hex
  txData: Hex
  collectionAddress: string | Hex
  recipientAddress: string | Hex
  approvedSpenderAddress?: string
  isDev?: boolean
  transactionConfirmations?: number
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  enableMainCurrencyPayment?: boolean
  enableSwapPayments?: boolean
  enableTransferFunds?: boolean
  creditCardProviders?: string[]
  copyrightText?: string
}

type SelectPaymentModalContext = {
  openSelectPaymentModal: (settings: SelectPaymentSettings) => void
  closeSelectPaymentModal: () => void
  selectPaymentSettings?: SelectPaymentSettings
}

export const [useSelectPaymentContext, SelectPaymentContextProvider] = createGenericContext<SelectPaymentModalContext>()
