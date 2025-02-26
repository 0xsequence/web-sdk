'use client'

import { createGenericContext } from './genericContext'

import { Theme } from '@0xsequence/kit'

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

export const [useCheckoutModalContext, CheckoutModalContextProvider] =
  createGenericContext<CheckoutModalContext>()
