import { useProjectAccessKey } from '@0xsequence/connect'
import { Button, Spinner, Text } from '@0xsequence/design-system'
import { useAPIClient } from '@0xsequence/hooks'
import React, { useEffect, useRef, useState } from 'react'

import { HEADER_HEIGHT } from '../constants/index.js'
import type { AddFundsSettings } from '../contexts/AddFundsModal.js'
import { useEnvironmentContext } from '../contexts/Environment.js'
import { useAddFundsModal, useSardineOnRampLink } from '../hooks/index.js'
import { getTransakLink } from '../utils/transak.js'

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
  const { sequenceTransakApiUrl } = useEnvironmentContext()
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const projectAccessKey = useProjectAccessKey()
  const [isLoading, setIsLoading] = useState(false)
  const [creationLinkFailed, setCreationLinkFailed] = useState(false)

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

  async function handleTransakLink({
    addFundsSettings,
    sequenceTransakApiUrl,
    projectAccessKey,
    setCreationLinkFailed,
    setIsLoading
  }: {
    addFundsSettings: AddFundsSettings
    sequenceTransakApiUrl: string
    projectAccessKey: string
    setCreationLinkFailed: (value: boolean) => void
    setIsLoading: (value: boolean) => void
  }) {
    try {
      setCreationLinkFailed(false)
      setIsLoading(true)
      const link = await getTransakLink(addFundsSettings, sequenceTransakApiUrl, projectAccessKey)

      if (link) {
        window.open(link, '_blank')
      } else {
        setCreationLinkFailed(true)
      }
      setIsLoading(false)
    } catch (error) {
      console.error(`The creation of the Transak link has failed. Error: `, error)
      setCreationLinkFailed(true)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    handleTransakLink({ addFundsSettings, sequenceTransakApiUrl, projectAccessKey, setIsLoading, setCreationLinkFailed })
  }, [])

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center w-full px-4 pb-4 h-full"
        style={{
          height: '600px',
          paddingTop: HEADER_HEIGHT
        }}
      >
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center w-full px-4 pb-4 h-full"
      style={{
        height: '600px',
        paddingTop: HEADER_HEIGHT
      }}
    >
      {creationLinkFailed ? (
        <div className="flex flex-col gap-2 items-center">
          <Text color="text100">The creation of the Transak link failed.</Text>
          <Button
            className="w-fit"
            onClick={() => {
              handleTransakLink({
                addFundsSettings,
                sequenceTransakApiUrl,
                projectAccessKey,
                setIsLoading,
                setCreationLinkFailed
              })
            }}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 items-center text-center">
          <Text color="text100">Once you've added funds, you can close this window and try buying with crypto again.</Text>
        </div>
      )}
    </div>
  )
}
