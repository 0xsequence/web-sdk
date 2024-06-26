'use client'

import { Theme } from '@0xsequence/kit'

import { createGenericContext } from './genericContext'

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
  onSuccess?: (transactionHash: string, settings: CreditCardCheckout) => void
  onError?: (error: Error, settings: CreditCardCheckout) => void
  isDev?: boolean
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

export const [useCheckoutModalContext, CheckoutModalContextProvider] = createGenericContext<CheckoutModalContext>()
