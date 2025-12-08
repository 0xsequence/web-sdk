import { compareAddress } from '@0xsequence/connect'
import type { ContractInfo, TokenMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork } from '@0xsequence/network'
import React, { useEffect, useMemo, useRef } from 'react'
import { formatUnits, zeroAddress, type Hex } from 'viem'

import type { TransakConfig } from '../../contexts/CheckoutModal.js'
import type { Collectible, CreditCardProviders } from '../../contexts/SelectPaymentModal.js'
import { getCurrencyCode, getTransakProxyAddress } from '../../utils/transak.js'
import { useTransakWidgetUrl } from '../useTransakWidgetUrl.js'
const TRANSAK_IFRAME_ID = 'credit-card-payment-transak-iframe'

export interface UseCreditCardPaymentArgs {
  chain: string | number
  currencyAddress: string
  totalPriceRaw: string
  collectible: Collectible
  collectionAddress: string
  recipientAddress: string
  targetContractAddress: string
  txData: Hex
  creditCardProvider?: CreditCardProviders
  transakConfig?: TransakConfig
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  currencyInfo: ContractInfo | undefined
  tokenMetadatas: TokenMetadata[] | undefined
  dataCollectionInfo: ContractInfo | undefined
  isLoadingCollectionInfo: boolean
  errorCollectionInfo: Error | null
  isLoadingTokenMetadatas: boolean
  errorTokenMetadata: Error | null
  isLoadingCurrencyInfo: boolean
  errorCurrencyInfo: Error | null
}

interface UseCreditCardPaymentData {
  iframeId: string
  paymentUrl?: string
  CreditCardIframe: React.ComponentType
  EventListener: React.ComponentType
}

export interface UseCreditCardPaymentReturn {
  error: Error | null
  data: UseCreditCardPaymentData
  isLoading: boolean
}

export const useCreditCardPayment = ({
  chain,
  currencyAddress,
  totalPriceRaw,
  collectible,
  collectionAddress,
  recipientAddress,
  targetContractAddress,
  txData,
  creditCardProvider,
  transakConfig,
  onSuccess,
  onError,
  currencyInfo,
  tokenMetadatas,
  dataCollectionInfo,
  isLoadingCollectionInfo,
  errorCollectionInfo,
  isLoadingTokenMetadatas,
  errorTokenMetadata,
  isLoadingCurrencyInfo,
  errorCurrencyInfo
}: UseCreditCardPaymentArgs): UseCreditCardPaymentReturn => {
  const disableTransakWidgetUrlFetch =
    isLoadingTokenMetadatas || isLoadingCurrencyInfo || isLoadingCollectionInfo || creditCardProvider !== 'transak'

  const network = findSupportedNetwork(chain)
  const error = errorCollectionInfo || errorTokenMetadata || errorCurrencyInfo
  const isLoading = isLoadingCollectionInfo || isLoadingTokenMetadatas || isLoadingCurrencyInfo
  const isNativeCurrency = compareAddress(currencyAddress, zeroAddress)
  const currencySymbol = isNativeCurrency ? network?.nativeToken.symbol : currencyInfo?.symbol || 'POL'
  const currencyDecimals = isNativeCurrency ? network?.nativeToken.decimals : currencyInfo?.decimals || 18
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const tokenMetadata = tokenMetadatas?.[0]

  // Transak requires the recipient address to be the proxy address
  // so we need to replace the recipient address with the proxy address in the calldata
  // this is a weird hack so that credit card integrations are as simple as possible and should work 99% of the time
  // If an issue arises, the user can override the calldata in the transak settings

  const transakProxyAddress = getTransakProxyAddress(network?.chainId || 137) || ''
  const calldataWithProxy =
    transakConfig?.callDataOverride ??
    txData.replace(recipientAddress.toLowerCase().substring(2), transakProxyAddress.substring(2))

  const price = Number(formatUnits(BigInt(totalPriceRaw), Number(currencyDecimals || 18)))

  const transakNftData = [
    {
      imageURL: tokenMetadata?.image || '',
      nftName: tokenMetadata?.name || 'collectible',
      collectionAddress: collectionAddress,
      tokenIDs: [collectible.tokenId || ''],
      prices: [price],
      quantity: Number(collectible.quantity),
      nftType: dataCollectionInfo?.type || 'ERC721'
    }
  ]

  const estimatedGasLimit = 500000

  const partnerOrderId = useMemo(() => {
    return `${recipientAddress}-${new Date().getTime()}`
  }, [recipientAddress])

  // Note: the network name might not always line up with Transak. A conversion function might be necessary
  const networkName = network?.name.toLowerCase()

  const {
    data: transakLinkData,
    isLoading: isLoadingTransakLink,
    error: errorTransakLink
  } = useTransakWidgetUrl(
    {
      isNFT: true,
      calldata: calldataWithProxy,
      targetContractAddress,
      cryptoCurrencyCode: getCurrencyCode({
        chainId: network?.chainId || 137,
        currencyAddress,
        defaultCurrencyCode: currencySymbol || 'ETH'
      }),
      estimatedGasLimit,
      nftData: transakNftData,
      walletAddress: recipientAddress,
      disableWalletAddressForm: true,
      partnerOrderId,
      network: networkName,
      referrerDomain: window.location.origin
    },
    disableTransakWidgetUrlFetch
  )

  const missingCreditCardProvider = !creditCardProvider

  if (missingCreditCardProvider) {
    return {
      error: new Error('Missing credit card provider or transak config'),
      data: {
        iframeId: '',
        CreditCardIframe: () => null,
        EventListener: () => null
      },
      isLoading: false
    }
  }

  if (error || isLoading) {
    return {
      error,
      data: {
        iframeId: '',
        CreditCardIframe: () => null,
        EventListener: () => null
      },
      isLoading
    }
  }

  if (creditCardProvider === 'transak') {
    const transakLink = transakLinkData?.url

    return {
      error: errorTransakLink,
      data: {
        iframeId: TRANSAK_IFRAME_ID,
        paymentUrl: transakLink,
        CreditCardIframe: () => (
          <div className="flex items-center justify-center" style={{ height: '770px' }}>
            <iframe
              id="transakIframe"
              ref={iframeRef}
              allow="camera;microphone;payment"
              src={transakLink}
              style={{
                maxHeight: '650px',
                height: '100%',
                maxWidth: '380px',
                width: '100%'
              }}
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ),
        EventListener: () => (
          <TransakEventListener onSuccess={onSuccess} onError={onError} isLoading={isLoading} iframeRef={iframeRef} />
        )
      },
      isLoading: isLoadingTransakLink
    }
  }

  return {
    error: null,
    data: {
      iframeId: '',
      CreditCardIframe: () => null,
      EventListener: () => null
    },
    isLoading: false
  }
}

interface TransakEventListenerProps {
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  isLoading: boolean
  iframeRef: React.RefObject<HTMLIFrameElement | null>
}

const TransakEventListener = ({ onSuccess, onError, isLoading, iframeRef }: TransakEventListenerProps) => {
  useEffect(() => {
    const transakIframe = iframeRef.current?.contentWindow
    if (!transakIframe) {
      return
    }

    const readMessage = async (message: any) => {
      if (message.source !== transakIframe) {
        return
      }

      if (message?.data?.event_id === 'TRANSAK_ORDER_SUCCESSFUL' && message?.data?.data?.status === 'COMPLETED') {
        console.log('Order Data: ', message?.data?.data)
        const txHash = message?.data?.data?.transactionHash || ''

        onSuccess?.(txHash)
      }

      if (message?.data?.event_id === 'TRANSAK_ORDER_FAILED') {
        onError?.(new Error('Transak transaction failed'))
      }
    }

    window.addEventListener('message', readMessage)

    return () => window.removeEventListener('message', readMessage)
  }, [isLoading])

  return null
}
