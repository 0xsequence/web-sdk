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

export type NavigationCheckout = PaymentMehodSelection

export type History = NavigationCheckout[]

type NavigationCheckoutContext = {
  setHistory: (history: History) => void
  history: History
  defaultLocation: PaymentMehodSelection
}

const [useNavigationCheckoutContext, NavigationCheckoutContextProvider] = createGenericContext<NavigationCheckoutContext>()

export { NavigationCheckoutContextProvider, useNavigationCheckoutContext }
