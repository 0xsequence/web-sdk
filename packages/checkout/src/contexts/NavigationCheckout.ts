'use client'

import { createGenericContext } from './genericContext.js'

export interface PaymentMethodSelectionParams {
  selectedCurrency?: {
    address: string
    chainId: number
  }
}

export interface PaymentMehodSelection {
  location: 'payment-method-selection'
  params: PaymentMethodSelectionParams
}

export interface TokenSelection {
  location: 'token-selection'
  params: {
    selectedCurrency: {
      address: string
      chainId: number
    }
  }
}

export type NavigationCheckout = PaymentMehodSelection | TokenSelection

export type HistoryCheckout = NavigationCheckout[]

type NavigationCheckoutContext = {
  setHistory: (history: HistoryCheckout) => void
  history: HistoryCheckout
  defaultLocation: NavigationCheckout
}

const [useNavigationCheckoutContext, NavigationCheckoutContextProvider] = createGenericContext<NavigationCheckoutContext>()

export { NavigationCheckoutContextProvider, useNavigationCheckoutContext }
