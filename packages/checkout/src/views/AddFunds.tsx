<<<<<<< HEAD
import { Spinner, Text } from '@0xsequence/design-system'
import { useEffect, useRef } from 'react'
=======
import { useProjectAccessKey } from '@0xsequence/connect'
import { Button, Spinner, Text } from '@0xsequence/design-system'
import { useEffect, useRef, useState } from 'react'
>>>>>>> 51730908 (feat(onramp): add optional Transak alternate flow with default and windowed modes)

import { HEADER_HEIGHT } from '../constants/index.js'
import type { AddFundsSettings } from '../contexts/AddFundsModal.js'
import { useAddFundsModal } from '../hooks/index.js'
<<<<<<< HEAD
import { useTransakWidgetUrl } from '../hooks/useTransakWidgetUrl.js'
=======
import { getTransakLink, getTransakLinkFromSequenceApi } from '../utils/transak.js'
>>>>>>> 51730908 (feat(onramp): add optional Transak alternate flow with default and windowed modes)

const EventTypeOrderCreated = 'TRANSAK_ORDER_CREATED'
const EventTypeOrderSuccessful = 'TRANSAK_ORDER_SUCCESSFUL'
const EventTypeOrderFailed = 'TRANSAK_ORDER_FAILED'

export const AddFundsContent = () => {
  // Select add funds provider
  return <AddFundsContentTransak />
}

export const AddFundsContentTransak = () => {
  const { addFundsSettings = {} as AddFundsSettings } = useAddFundsModal()
<<<<<<< HEAD

  const {
    data: transakLinkData,
    isLoading: isLoadingTransakLink,
    error: errorTransakLink
  } = useTransakWidgetUrl({
    referrerDomain: window.location.origin,
    walletAddress: addFundsSettings.walletAddress,
    fiatAmount: addFundsSettings?.fiatAmount,
    disableWalletAddressForm: true,
    fiatCurrency: addFundsSettings?.fiatCurrency || 'USD',
    defaultFiatAmount: addFundsSettings?.defaultFiatAmount || '50',
    defaultCryptoCurrency: addFundsSettings?.defaultCryptoCurrency || 'USDC',
    cryptoCurrencyList: addFundsSettings?.cryptoCurrencyList
  })
=======
  const { transakApiUrl, transakApiKey, sequenceTransakApiUrl } = useEnvironmentContext()
>>>>>>> 51730908 (feat(onramp): add optional Transak alternate flow with default and windowed modes)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const projectAccessKey = useProjectAccessKey()
  const [isLoading, setIsLoading] = useState(false)
  const [creationLinkFailed, setCreationLinkFailed] = useState(false)
  const { transakOnRampKind = 'default' } = addFundsSettings
  const isTransakOnRampKindWindowed = transakOnRampKind === 'windowed'

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

  const link = transakLinkData?.url

  if (isLoadingTransakLink) {
    return (
      <div className="flex items-center justify-center w-full px-4 pb-4 h-[200px]">
        <Spinner />
      </div>
    )
  }

  if (errorTransakLink) {
    return (
      <div className="flex items-center justify-center w-full px-4 pb-4 h-[200px]">
        <Text color="text100">An error has occurred</Text>
      </div>
    )
  }

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
      const link = await getTransakLinkFromSequenceApi(addFundsSettings, sequenceTransakApiUrl, projectAccessKey)

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
    if (!isTransakOnRampKindWindowed) {
      return
    }

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

  if (isTransakOnRampKindWindowed) {
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
