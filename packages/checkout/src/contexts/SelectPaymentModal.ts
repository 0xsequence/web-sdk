import { createGenericContext } from './genericContext'
import { Hex } from 'viem'

export interface PayWithCryptoSettings {
  chainId: number,
  currencyAddress: string,
  price: string,
  targetContractAddress: string,
  txData: Hex,
  enableSwapPayments: boolean,
  transactionConfirmations?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export interface PayWithCreditCardSettings {
  chainId: number,
  currencyAddress: string,
  price: string,
  targetContractAddress: string,
  txData: Hex,
  tokenId: string
  collectionAddress: string
  nftQuantity: string
  nftDecimals?: string
  isDev?: boolean,
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export interface SelectPaymentSettings {
  payWithCrypto?: PayWithCryptoSettings
  payWithCreditCard?: PayWithCreditCardSettings
}

type SelectPaymentModalContext = {
  openSelectPaymentModal: (settings: SelectPaymentSettings) => void
  closeSelectPaymentModal: () => void
  selectPaymentSettings?: SelectPaymentSettings
}

export const [useSelectPaymentContext, SelectPaymentContextProvider] = createGenericContext<SelectPaymentModalContext>()
