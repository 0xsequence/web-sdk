import { useAPIClient } from '@0xsequence/kit'
import { Box, Spinner, Text } from '@0xsequence/design-system'
import React, { useEffect } from 'react'

import { HEADER_HEIGHT } from '../constants'
import { useAddFundsModal, useSardineOnRampLink } from '../hooks'
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

  const { provider } = addFundsSettings

  if (provider === 'transak') {
    return <AddFundsContentTransak />
  } else {
    return <AddFundsContentSardine />
  }
}

export const AddFundsContentSardine = () => {
  const { addFundsSettings } = useAddFundsModal()

  const network = addFundsSettings?.networks?.split(',')?.[0]
  const apiClient = useAPIClient()

  const {
    data: sardineLinkOnRamp,
    isLoading: isLoadingSardineLinkOnRamp,
    isError: isErrorSardineLinkOnRamp
  } = useSardineOnRampLink({
    apiClient: apiClient,
    walletAddress: addFundsSettings!.walletAddress,
    fundingAmount: addFundsSettings?.fiatAmount,
    currencyCode: addFundsSettings?.defaultCryptoCurrency,
    network
  })

  // Draft: User created an order
  // Expired: User did not confirm the purchase
  // Declined: Purchase attempt was declined
  // Processing: Waiting for payment/deposit confirmation
  // Processed: Payment/deposit successfully processed
  // Complete: Order executed and delivered to the user

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

  const Container = ({ children }: { children: React.ReactNode }) => {
    return (
      <Box
        alignItems="center"
        justifyContent="center"
        width="full"
        paddingX="4"
        paddingBottom="4"
        height="full"
        style={{
          height: '600px',
          paddingTop: HEADER_HEIGHT
        }}
      >
        {children}
      </Box>
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
      <Box
        id={IframeId}
        as="iframe"
        width="full"
        height="full"
        borderWidth="none"
        src={sardineLinkOnRamp}
        allow="camera *;geolocation *"
      />
    </Container>
  )
}

export const AddFundsContentTransak = () => {
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
      <Box id={IframeId} as="iframe" width="full" height="full" borderWidth="none" src={link} allow="camera;microphone;payment" />
    </Box>
  )
}
