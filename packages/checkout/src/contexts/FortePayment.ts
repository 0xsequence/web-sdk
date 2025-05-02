'use client'

import { CreditCardCheckout } from './CheckoutModal'
import { createGenericContext } from './genericContext'

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
