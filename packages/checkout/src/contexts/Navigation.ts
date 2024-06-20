'use client'
import { CreditCardCheckout } from '../contexts'

import { createGenericContext } from './genericContext'

export interface SelectCheckoutNavigation {
  location: 'select-method-checkout'
}

export interface TransactionFormNavigation {
  location: 'transaction-form'
}

export interface TransactionSuccessParams {
  transactionHash: string
}

export interface TransactionSuccessNavigation {
  location: 'transaction-success'
  params: TransactionSuccessParams
}

export interface TransactionErrorParams {
  error: Error
}

export interface TransactionErrorNavigation {
  location: 'transaction-error'
  params: TransactionErrorParams
}

export interface TransactionPendingParams {
  creditCardCheckout: CreditCardCheckout
}

export interface TransactionPendingNavigation {
  location: 'transaction-pending'
  params: TransactionPendingParams
}

export type Navigation =
  | TransactionFormNavigation
  | TransactionSuccessNavigation
  | TransactionErrorNavigation
  | TransactionPendingNavigation
  | SelectCheckoutNavigation

export type History = Navigation[]

type NavigationContext = {
  setHistory: (history: History) => void
  history: History
  defaultLocation: Navigation
}

export const [useNavigationContext, NavigationContextProvider] = createGenericContext<NavigationContext>()
