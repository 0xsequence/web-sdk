import { Spinner, Text } from '@0xsequence/design-system'
import { useAPIClient } from '@0xsequence/hooks'
import React, { useEffect, useRef } from 'react'

import { HEADER_HEIGHT } from '../constants'
import { useEnvironmentContext } from '../contexts'
import type { AddFundsSettings } from '../contexts/AddFundsModal'
import { useAddFundsModal, useSardineOnRampLink } from '../hooks'
import { getTransakLink } from '../utils/transak'

const EventTypeOrderCreated = 'TRANSAK_ORDER_CREATED'
const EventTypeOrderSuccessful = 'TRANSAK_ORDER_SUCCESSFUL'
const EventTypeOrderFailed = 'TRANSAK_ORDER_FAILED'

export const AddFundsContent = () => {
  const { addFundsSettings = {} as AddFundsSettings } = useAddFundsModal()

  const { provider } = addFundsSettings

  if (provider === 'transak') {
    return <AddFundsContentTransak />
  } else {
    return <AddFundsContentSardine />
  }
}

export const AddFundsContentSardine = () => {
  const { addFundsSettings } = useAddFundsModal()
  const { sardineOnRampUrl } = useEnvironmentContext()
  const network = addFundsSettings?.networks?.split(',')?.[0]
  const apiClient = useAPIClient()
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const {
    data: sardineLinkOnRamp,
    isLoading: isLoadingSardineLinkOnRamp,
    isError: isErrorSardineLinkOnRamp
  } = useSardineOnRampLink({
    sardineOnRampUrl,
    apiClient: apiClient,
    walletAddress: addFundsSettings!.walletAddress,
    fundingAmount: addFundsSettings?.fiatAmount,
    currencyCode: addFundsSettings?.defaultCryptoCurrency,
    network
  })

  useEffect(() => {
    const handleMessage = (message: MessageEvent<any>) => {
      const iframe = iframeRef.current?.contentWindow
      if (message.source === iframe) {
        const data = message.data
        const status = data.status as string
        switch (status) {
          case 'draft':
            addFundsSettings?.onOrderCreated?.(data)
            break
          case 'expired':
          case 'decline':
            addFundsSettings?.onOrderFailed?.(data)
            break
          case 'processed':
            addFundsSettings?.onOrderSuccessful?.(data)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const Container = ({ children }: { children: React.ReactNode }) => {
    return (
      <div
        className="flex items-center justify-center w-full px-4 pb-4 h-full"
        style={{
          height: '600px',
          paddingTop: HEADER_HEIGHT
        }}
      >
        {children}
      </div>
    )
  }

  if (isLoadingSardineLinkOnRamp) {
    return (
      <Container>
        <Spinner />
      </Container>
    )
  }

  if (isErrorSardineLinkOnRamp) {
    return (
      <Container>
        <Text color="text100">An error has occurred</Text>
      </Container>
    )
  }

  return (
    <Container>
      <iframe ref={iframeRef} className="w-full h-full border-0" src={sardineLinkOnRamp} allow="camera *;geolocation *" />
    </Container>
  )
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
