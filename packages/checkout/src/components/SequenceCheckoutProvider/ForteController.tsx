import { useState, useEffect } from 'react'

import { fetchFortePaymentStatus } from '../../api/data.js'
import { useEnvironmentContext, FortePaymentControllerProvider, type FortePaymentData } from '../../contexts/index.js'

const POLLING_TIME = 10 * 1000

export const ForteController = ({ children }: { children: React.ReactNode }) => {
  const [fortePaymentData, setFortePaymentData] = useState<FortePaymentData>()
  const { forteWidgetUrl } = useEnvironmentContext()
  // const { env } = useConfig()
  // const apiUrl = env.apiUrl

  const apiUrl = 'http://localhost:4422'

  const initializeWidget = (fortePaymentData: FortePaymentData) => {
    setFortePaymentData(fortePaymentData)
  }

  const resetWidget = () => {
    setFortePaymentData(undefined)
    document.getElementById('forte-widget-script')?.remove()
    document.getElementById('forte-payments-widget-container')?.remove()
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    let widgetClosedListener: () => void

    if (fortePaymentData) {
      interval = setInterval(() => {
        checkFortePaymentStatus()
      }, POLLING_TIME)

      widgetClosedListener = () => {
        fortePaymentData.creditCardCheckout?.onClose?.()
        resetWidget()
      }

      window.addEventListener('FortePaymentsWidgetClosed', widgetClosedListener)
    }

    return () => {
      clearInterval(interval)
      window.removeEventListener('FortePaymentsWidgetClosed', widgetClosedListener)
    }
  }, [fortePaymentData])

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

    const widgetData = fortePaymentData.widgetData
    script.onload = () => {
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

    document.body.appendChild(script)
  }, [fortePaymentData])

  const checkFortePaymentStatus = async () => {
    if (!fortePaymentData) {
      return
    }

    const { status } = await fetchFortePaymentStatus(apiUrl, {
      paymentIntentId: fortePaymentData.paymentIntentId
    })

    if (status === 'Approved') {
      fortePaymentData.creditCardCheckout?.onSuccess?.()
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
        initializeWidget,
        resetWidget
      }}
    >
      {children}
    </FortePaymentControllerProvider>
  )
}
