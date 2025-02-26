import { Box } from '@0xsequence/design-system'
import React, { useEffect } from 'react'

import { HEADER_HEIGHT } from '../constants'
import { useAddFundsModal } from '../hooks'
import { getTransakLink } from '../utils/transak'

const IframeId = 'sequenceOnRamp'
const EventTypeOrderCreated = 'TRANSAK_ORDER_CREATED'
const EventTypeOrderSuccessful = 'TRANSAK_ORDER_SUCCESSFUL'
const EventTypeOrderFailed = 'TRANSAK_ORDER_FAILED'

export const AddFundsContent = () => {
  const { addFundsSettings } = useAddFundsModal()

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

  const link = getTransakLink(addFundsSettings)

  return (
    <Box
      alignItems="center"
      width="full"
      paddingX="4"
      paddingBottom="4"
      height="full"
      style={{
        height: '600px',
        paddingTop: HEADER_HEIGHT
      }}
    >
      <Box id={IframeId} as="iframe" width="full" height="full" borderWidth="none" src={link} />
    </Box>
  )
}
