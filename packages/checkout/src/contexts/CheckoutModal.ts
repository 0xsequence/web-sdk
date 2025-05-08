'use client'

import type { Theme } from '@0xsequence/design-system'

import { createGenericContext } from './genericContext'
import type { SupplementaryAnalyticsInfo } from './SelectPaymentModal'

interface CoinQuantity {
  contractAddress: string
  amountRequiredRaw: string
}

interface OrderSummaryItem {
  chainId: number
  contractAddress: string
  quantityRaw: string
  tokenId: string
}

export interface TransakConfig {
  apiKey: string
  contractId: string
  callDataOverride?: string
}

export interface CreditCardCheckout {
  chainId: number
  contractAddress: string
  recipientAddress: string
  currencyQuantity: string
  currencySymbol: string
  currencyAddress: string
  currencyDecimals: string
  nftId: string
  nftAddress: string
  nftQuantity: string
  nftDecimals?: string
  calldata: string
  provider?: 'sardine' | 'transak'
  transakConfig?: TransakConfig
  onSuccess?: (transactionHash: string, settings: CreditCardCheckout) => void
  onError?: (error: Error, settings: CreditCardCheckout) => void
  onClose?: () => void
  approvedSpenderAddress?: string
  supplementaryAnalyticsInfo?: SupplementaryAnalyticsInfo
}

export interface CheckoutSettings {
  creditCardCheckout?: CreditCardCheckout
  cryptoCheckout?: {
    chainId: number
    triggerTransaction: () => void
    coinQuantity: CoinQuantity
  }
  orderSummaryItems?: OrderSummaryItem[]
}

type CheckoutModalContext = {
  triggerCheckout: (settings: CheckoutSettings) => void
  closeCheckout: () => void
  settings?: CheckoutSettings
  theme: Theme
}

const [useCheckoutModalContext, CheckoutModalContextProvider] = createGenericContext<CheckoutModalContext>()

export { CheckoutModalContextProvider, useCheckoutModalContext }
