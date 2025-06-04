'use client'

import { type CreditCardCheckout } from './CheckoutModal.js'
import { createGenericContext } from './genericContext.js'

export interface FortePaymentData {
  paymentIntentId: string
  widgetData: any
  accessToken: string
  tokenType: string
  creditCardCheckout: CreditCardCheckout
}

export interface FortePaymentController {
  data?: FortePaymentData
  initializeWidget: (fortePaymentData: FortePaymentData) => void
  resetWidget: () => void
}

const [useFortePaymentController, FortePaymentControllerProvider] = createGenericContext<FortePaymentController>()

export { useFortePaymentController, FortePaymentControllerProvider }
