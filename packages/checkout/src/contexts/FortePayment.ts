'use client'

import { type CreditCardCheckoutSettings } from './CreditCardCheckout.js'
import { createGenericContext } from './genericContext.js'

export interface FortePaymentData {
  paymentIntentId: string
  widgetData: any
  creditCardCheckout: CreditCardCheckoutSettings
}

export interface FortePaymentController {
  data?: FortePaymentData
  initializeWidget: (fortePaymentData: FortePaymentData) => void
}

const [useFortePaymentController, FortePaymentControllerProvider] = createGenericContext<FortePaymentController>()

export { FortePaymentControllerProvider, useFortePaymentController }
