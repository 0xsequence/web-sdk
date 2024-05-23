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

export interface SardineCheckout {
  defaultPaymentMethodType: 'us_debit' | 'us_credit' | 'international_debit' | 'international_credit' | 'ach'
  chainId: number
  platform: string
  contractAddress: string
  blockchainNftId: string
  recipientAddress: string
  quantity: number
  decimals?: number
  onSuccess?: (transactionHash: string, settings: SardineCheckout) => void
  onError?: (error: Error, settings: SardineCheckout) => void
  isDev?: boolean
}

export interface CheckoutSettings {
  sardineCheckout?: SardineCheckout
  cryptoCheckout?: {
    chainId: number
    triggerTransaction: () => void
    coinQuantity: CoinQuantity
  }
  orderSummaryItems: OrderSummaryItem[]
}

type CheckoutModalContext = {
  triggerCheckout: (settings: CheckoutSettings) => void
  closeCheckout: () => void
  settings?: CheckoutSettings
  theme: Theme
}

export const [useCheckoutModalContext, CheckoutModalContextProvider] = createGenericContext<CheckoutModalContext>()
