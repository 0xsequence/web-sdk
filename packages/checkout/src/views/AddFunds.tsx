import { Button, Spinner, Text } from '@0xsequence/design-system'
import { useEffect, useRef } from 'react'

import { HEADER_HEIGHT } from '../constants/index.js'
import type { AddFundsSettings } from '../contexts/AddFundsModal.js'
import { useAddFundsModal } from '../hooks/index.js'
import { useTransakWidgetUrl } from '../hooks/useTransakWidgetUrl.js'

const EventTypeOrderCreated = 'TRANSAK_ORDER_CREATED'
const EventTypeOrderSuccessful = 'TRANSAK_ORDER_SUCCESSFUL'
const EventTypeOrderFailed = 'TRANSAK_ORDER_FAILED'

export const AddFundsContent = () => {
  // Select add funds provider
  return <AddFundsContentTransak />
}

export const AddFundsContentTransak = () => {
  const { addFundsSettings = {} as AddFundsSettings } = useAddFundsModal()

  const {
    data: transakLinkData,
    isLoading: isLoadingTransakLink,
    isError: isErrorTransakLink,
    refetch: refetchTransakLink
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
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

  useEffect(() => {
    if (isTransakOnRampKindWindowed && !isLoadingTransakLink && link) {
      window.open(link, '_blank', 'noopener')
    }
  }, [isTransakOnRampKindWindowed, isLoadingTransakLink, link])

  if (isLoadingTransakLink) {
    return (
      <div className="flex items-center justify-center w-full px-4 pb-4 h-[200px]">
        <Spinner />
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
        {isErrorTransakLink ? (
          <div className="flex flex-col gap-2 items-center">
            <Text color="text100">The creation of the Transak link failed.</Text>
            <Button
              className="w-fit"
              onClick={() => {
                // @ts-ignore-next-line
                refetchTransakLink()
              }}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 items-center text-center">
            <Text color="text100">{addFundsSettings?.windowedOnRampMessage || 'Funds will be added from another window.'}</Text>
          </div>
        )}
      </div>
    )
  }

  if (isErrorTransakLink) {
    return (
      <div className="flex items-center justify-center w-full px-4 pb-4 h-[200px]">
        <Text color="text100">An error has occurred</Text>
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
