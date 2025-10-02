import { useConfig } from '@0xsequence/hooks'
import { useEffect, useState } from 'react'

import { fetchFortePaymentStatus } from '../../api/data.js'
import { FortePaymentControllerProvider, useEnvironmentContext, type FortePaymentData } from '../../contexts/index.js'

const POLLING_TIME = 10 * 1000

export const ForteController = ({ children }: { children: React.ReactNode }) => {
  const [fortePaymentData, setFortePaymentData] = useState<FortePaymentData>()
  const { forteWidgetUrl } = useEnvironmentContext()
  const [isSuccess, setIsSuccess] = useState(false)
  const [widgetInitialized, setWidgetInitialized] = useState(false)
  const { env, projectAccessKey } = useConfig()
  const apiUrl = env.apiUrl

  const initializeWidget = (fortePaymentData: FortePaymentData) => {
    setIsSuccess(false)
    setFortePaymentData(fortePaymentData)
  }

  useEffect(() => {
    const widgetInitializedListener: () => void = () => {
      setWidgetInitialized(true)
    }

    if (!widgetInitialized) {
      window.addEventListener('FortePaymentsWidgetLoaded', widgetInitializedListener)
    }

    return () => {
      window.removeEventListener('FortePaymentsWidgetLoaded', widgetInitializedListener)
    }
  }, [widgetInitialized, fortePaymentData])

  useEffect(() => {
    if (widgetInitialized && fortePaymentData) {
      const widgetData = fortePaymentData.widgetData

      // @ts-ignore-next-line
      if (window?.initFortePaymentsWidget && widgetData) {
        const data = {
          notes: widgetData.notes,
          widget_data: widgetData.widgetData,
          payment_intent_id: widgetData.paymentIntentId,
          error_code: widgetData.error_code ?? null,
          flow: widgetData.flow
        }

        // @ts-ignore-next-line
        window.initFortePaymentsWidget({
          containerId: 'forte-payments-widget-container',
          data
        })
      }
    }
  }, [widgetInitialized, fortePaymentData])

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    let eventFortePaymentsWidgetClosedListener: (e: Event) => void
    let eventFortePaymentsBuyNftMintSuccessListener: (e: Event) => void
    let eventFortePaymentsBuyNftSuccessListener: (e: Event) => void

    if (fortePaymentData && !isSuccess) {
      interval = setInterval(() => {
        checkFortePaymentStatus()
      }, POLLING_TIME)
    }

    if (fortePaymentData) {
      eventFortePaymentsWidgetClosedListener = (e: Event) => {
        fortePaymentData?.creditCardCheckout?.forteConfig?.onFortePaymentsWidgetClosed?.(e)
        fortePaymentData.creditCardCheckout?.onClose?.()
      }

      eventFortePaymentsBuyNftMintSuccessListener = (e: Event) => {
        fortePaymentData?.creditCardCheckout?.forteConfig?.onFortePaymentsBuyNftMintSuccess?.(e)
        fortePaymentData.creditCardCheckout?.onClose?.()
        setIsSuccess(true)
      }

      eventFortePaymentsBuyNftSuccessListener = (e: Event) => {
        fortePaymentData?.creditCardCheckout?.forteConfig?.onFortePaymentsBuyNftSuccess?.(e)
        fortePaymentData.creditCardCheckout?.onClose?.()
        setIsSuccess(true)
      }

      // Note: these events are mutually exclusive. ie they won't trigger at the same time
      // FortePaymentsWidgetClosed only trigger when NOT in a success state
      window.addEventListener('FortePaymentsWidgetClosed', eventFortePaymentsWidgetClosedListener)
      window.addEventListener('FortePaymentsBuyNftMintSuccess', eventFortePaymentsBuyNftMintSuccessListener)
      window.addEventListener('FortePaymentsBuyNftSuccess', eventFortePaymentsBuyNftSuccessListener)
    }

    return () => {
      clearInterval(interval)
      window.removeEventListener('FortePaymentsWidgetClosed', eventFortePaymentsWidgetClosedListener)
      window.removeEventListener('FortePaymentsBuyNftMintSuccess', eventFortePaymentsBuyNftMintSuccessListener)
      window.removeEventListener('FortePaymentsBuyNftSuccess', eventFortePaymentsBuyNftSuccessListener)
    }
  }, [fortePaymentData, isSuccess, widgetInitialized])

  useEffect(() => {
    if (!fortePaymentData) {
      return
    }
    if (document.getElementById('forte-widget-script')) {
      return
    }

    const container = document.createElement('div')
    container.id = 'forte-payments-widget-container'
    document.body.appendChild(container)

    const script = document.createElement('script')
    script.id = 'forte-widget-script'
    script.type = 'module'
    script.async = true
    script.src = forteWidgetUrl

    document.body.appendChild(script)

    // After loading the script, Forte will generate a FortePaymentsWidgetLoaded event when the widget is ready to be called
  }, [fortePaymentData])

  const checkFortePaymentStatus = async () => {
    if (!fortePaymentData || isSuccess) {
      return
    }

    const { status } = await fetchFortePaymentStatus(apiUrl, projectAccessKey, {
      paymentIntentId: fortePaymentData.paymentIntentId
    })

    if (status === 'Approved' && !isSuccess) {
      fortePaymentData.creditCardCheckout?.onSuccess?.()
      setIsSuccess(true)
    }

    if (status === 'Declined' || status === 'Expired') {
      fortePaymentData.creditCardCheckout?.onError?.(
        new Error('A problem occurred while processing your payment'),
        fortePaymentData.creditCardCheckout
      )
    }
  }

  return (
    <FortePaymentControllerProvider
      value={{
        data: fortePaymentData,
        initializeWidget
      }}
    >
      {children}
    </FortePaymentControllerProvider>
  )
}
