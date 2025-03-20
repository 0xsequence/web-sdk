import React, { useEffect } from 'react'

import { HEADER_HEIGHT } from '../constants'
import { useEnvironmentContext } from '../contexts'
import { useAddFundsModal } from '../hooks'
import { getTransakLink } from '../utils/transak'

const IframeId = 'sequenceOnRamp'
const EventTypeOrderCreated = 'TRANSAK_ORDER_CREATED'
const EventTypeOrderSuccessful = 'TRANSAK_ORDER_SUCCESSFUL'
const EventTypeOrderFailed = 'TRANSAK_ORDER_FAILED'

export const AddFundsContent = () => {
  const { addFundsSettings } = useAddFundsModal()
  const { transakApiUrl, transakApiKey } = useEnvironmentContext()
  if (!addFundsSettings) {
    return
  }

  useEffect(() => {
    window.addEventListener('message', messageReceived)
    return () => {
      window.removeEventListener('message', messageReceived)
    }
  }, [])

  function messageReceived(message: MessageEvent<any>) {
    const element = document.getElementById(IframeId) as HTMLIFrameElement | undefined
    const iframe = element?.contentWindow
    if (message.source === iframe) {
      const data = message.data
      const eventType = data.eventType as string
      switch (eventType) {
        case EventTypeOrderCreated:
          addFundsSettings?.onOrderCreated?.(data)
          break
        case EventTypeOrderSuccessful:
          addFundsSettings?.onOrderSuccessful?.(data)
          break
        case EventTypeOrderFailed:
          addFundsSettings?.onOrderFailed?.(data)
          break
      }
    }
  }

  const link = getTransakLink(addFundsSettings, {
    transakApiUrl,
    transakApiKey
  })

  return (
    <div
      className="flex items-center w-full px-4 pb-4 h-full"
      style={{
        height: '600px',
        paddingTop: HEADER_HEIGHT
      }}
    >
      <iframe className="w-full h-full border-0" id={IframeId} src={link} />
    </div>
  )
}
