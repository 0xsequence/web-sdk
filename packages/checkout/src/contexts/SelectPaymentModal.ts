import { Hex } from 'viem'

import { createGenericContext } from './genericContext'

export type CreditCardProviders = 'sardine' | 'transak'

export interface SelectPaymentSettings {
  chain: number | string
  currencyAddress: string | Hex
  price: string
  targetContractAddress: string | Hex
  txData: Hex
  tokenIds: string[]
  collectionAddress: string | Hex
  nftQuantities: string[]
  recipientAddress: string | Hex
  nftDecimals?: string[]
  isDev?: boolean
  transactionConfirmations?: number
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  enableMainCurrencyPayment?: boolean
  enableSwapPayments?: boolean
  creditCardProviders?: string[]
}

type SelectPaymentModalContext = {
  openSelectPaymentModal: (settings: SelectPaymentSettings) => void
  closeSelectPaymentModal: () => void
  selectPaymentSettings?: SelectPaymentSettings
}

export const [useSelectPaymentContext, SelectPaymentContextProvider] = createGenericContext<SelectPaymentModalContext>()
