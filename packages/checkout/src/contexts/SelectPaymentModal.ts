import { TransactionOnRampProvider } from '@0xsequence/marketplace'
import { Hex } from 'viem'

import type { TransakConfig } from '../contexts/CheckoutModal'

import { createGenericContext } from './genericContext'

export type CreditCardProviders = 'sardine' | 'transak'

export interface Collectible {
  tokenId: string
  quantity: string
  decimals?: number
  price?: string
}

export interface SupplementaryAnalyticsInfo {
  [key: string]: string
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
  transactionConfirmations?: number
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  onClose?: () => void
  onRampProvider?: TransactionOnRampProvider
  enableMainCurrencyPayment?: boolean
  enableSwapPayments?: boolean
  enableTransferFunds?: boolean
  creditCardProviders?: string[]
  copyrightText?: string
  transakConfig?: TransakConfig
  customProviderCallback?: (onSuccess: (txHash: string) => void, onError: (error: Error) => void, onClose: () => void) => void
  supplementaryAnalyticsInfo?: SupplementaryAnalyticsInfo
}

type SelectPaymentModalContext = {
  openSelectPaymentModal: (settings: SelectPaymentSettings) => void
  closeSelectPaymentModal: () => void
  selectPaymentSettings?: SelectPaymentSettings
}

const [useSelectPaymentContext, SelectPaymentContextProvider] = createGenericContext<SelectPaymentModalContext>()

export { useSelectPaymentContext, SelectPaymentContextProvider }
