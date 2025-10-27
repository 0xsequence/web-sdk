import { Spinner, Text } from '@0xsequence/design-system'
import { useAPIClient } from '@0xsequence/hooks'
import React, { useEffect, useRef } from 'react'

import { HEADER_HEIGHT } from '../constants/index.js'
import type { AddFundsSettings } from '../contexts/AddFundsModal.js'
import { useEnvironmentContext } from '../contexts/Environment.js'
import { useAddFundsModal } from '../hooks/index.js'
import { getTransakLink } from '../utils/transak.js'

const EventTypeOrderCreated = 'TRANSAK_ORDER_CREATED'
const EventTypeOrderSuccessful = 'TRANSAK_ORDER_SUCCESSFUL'
const EventTypeOrderFailed = 'TRANSAK_ORDER_FAILED'

export const AddFundsContent = () => {
  // Select add funds provider
  return <AddFundsContentTransak />
}

export const AddFundsContentTransak = () => {
  const { addFundsSettings = {} as AddFundsSettings } = useAddFundsModal()
  const { transakApiUrl, transakApiKey } = useEnvironmentContext()
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const handleMessage = (message: MessageEvent<any>) => {
      const iframe = iframeRef.current?.contentWindow

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

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

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
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        src={link}
        allow="camera;microphone;payment"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}
