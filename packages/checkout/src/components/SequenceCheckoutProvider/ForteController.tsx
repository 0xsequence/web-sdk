import { useState, useEffect } from 'react'

import { fetchFortePaymentStatus } from '../../api'
import { FortePaymentControllerProvider, FortePaymentData } from '../../contexts'
import { useEnvironmentContext } from '../../contexts/Environment'

const POLLING_TIME = 10 * 1000

export const ForteController = ({ children }: { children: React.ReactNode }) => {
  const [fortePaymentData, setFortePaymentData] = useState<FortePaymentData>()
  const { fortePaymentUrl, forteWidgetUrl } = useEnvironmentContext()

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
        // @ts-ignore-next-line
        window.initFortePaymentsWidget({
          containerId: 'forte-payments-widget-container',
          data: widgetData
        })
      }
    }

    document.body.appendChild(script)
  }, [fortePaymentData])

  const checkFortePaymentStatus = async () => {
    if (!fortePaymentData) {
      return
    }

    const { status } = await fetchFortePaymentStatus(fortePaymentUrl, {
      accessToken: fortePaymentData.accessToken,
      tokenType: fortePaymentData.tokenType,
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
