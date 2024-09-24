import { createGenericContext } from './genericContext'
import { Hex } from 'viem'

export interface SelectPaymentSettings {
  chain: number | string,
  currencyAddress: string | Hex,
  price: string,
  targetContractAddress: string | Hex,
  txData: Hex,
  tokenId: string
  collectionAddress: string | Hex
  nftQuantity: string
  recipientAddress: string | Hex
  nftDecimals?: string
  isDev?: boolean,
  transactionConfirmations?: number
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  enableMainCurrencyPayment?: boolean
  enableSwapPayments?: boolean
  enableCreditCardPayments?: boolean
}

type SelectPaymentModalContext = {
  openSelectPaymentModal: (settings: SelectPaymentSettings) => void
  closeSelectPaymentModal: () => void
  selectPaymentSettings?: SelectPaymentSettings
}

export const [useSelectPaymentContext, SelectPaymentContextProvider] = createGenericContext<SelectPaymentModalContext>()
