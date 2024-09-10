import { createGenericContext } from './genericContext'
import { Hex } from 'viem'

export interface PayWithCryptoSettings {
  chain: number | string,
  currencyAddress: string,
  price: string,
  targetContractAddress: string,
  txData: Hex,
  enableSwapPayments: boolean,
  transactionConfirmations?: number
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
}

export interface PayWithCreditCardSettings {
  chain: number | string,
  currencyAddress: string,
  price: string,
  targetContractAddress: string,
  txData: Hex,
  tokenId: string
  collectionAddress: string
  nftQuantity: string
  nftDecimals?: string
  isDev?: boolean,
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
}

export interface OtherOptionsSettings {
  enableTransferFunds?: boolean
  enableFiatOnRamp?: boolean
}

export interface SelectPaymentSettings {
  payWithCrypto?: PayWithCryptoSettings
  payWithCreditCard?: PayWithCreditCardSettings
  otherOptions?: OtherOptionsSettings
}

type SelectPaymentModalContext = {
  openSelectPaymentModal: (settings: SelectPaymentSettings) => void
  closeSelectPaymentModal: () => void
  selectPaymentSettings?: SelectPaymentSettings
}

export const [useSelectPaymentContext, SelectPaymentContextProvider] = createGenericContext<SelectPaymentModalContext>()
