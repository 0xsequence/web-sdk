import { Spinner, Text } from '@0xsequence/design-system'
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

  const defaultNetworks =
    'ethereum,mainnet,arbitrum,optimism,polygon,polygonzkevm,zksync,base,bnb,oasys,astar,avaxcchain,immutablezkevm'

  const {
    data: transakLinkData,
    isLoading: isLoadingTransakLink,
    error: errorTransakLink
  } = useTransakWidgetUrl({
    referrerDomain: window.location.origin,
    walletAddress: addFundsSettings.walletAddress,
    fiatAmount: addFundsSettings?.fiatAmount ? Number(addFundsSettings?.fiatAmount) : undefined,
    fiatCurrency: addFundsSettings?.fiatCurrency,
    disableWalletAddressForm: true,
    defaultFiatAmount: addFundsSettings?.defaultFiatAmount || '50',
    defaultCryptoCurrency: addFundsSettings?.defaultCryptoCurrency || 'USDC',
    cryptoCurrencyList: addFundsSettings?.cryptoCurrencyList
  })
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

  const link = transakLinkData?.url

  if (isLoadingTransakLink) {
    return (
      <div className="flex items-center justify-center w-full px-4 pb-4 h-full">
        <Spinner />
      </div>
    )
  }

  if (errorTransakLink) {
    return (
      <div className="flex items-center justify-center w-full px-4 pb-4 h-full">
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
