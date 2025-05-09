import { useProjectAccessKey } from '@0xsequence/connect'
import { compareAddress } from '@0xsequence/connect'
import { useConfig } from '@0xsequence/hooks'
import type { ContractInfo, TokenMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork } from '@0xsequence/network'
import pako from 'pako'
import React, { useEffect, useRef } from 'react'
import { formatUnits, zeroAddress, type Hex } from 'viem'

import { fetchSardineOrderStatus } from '../../api/data.js'
import type { TransakConfig } from '../../contexts/CheckoutModal.js'
import { useEnvironmentContext } from '../../contexts/Environment.js'
import type { Collectible, CreditCardProviders } from '../../contexts/SelectPaymentModal.js'
import { TRANSAK_PROXY_ADDRESS } from '../../utils/transak.js'
import { useSardineClientToken } from '../useSardineClientToken.js'

const POLLING_TIME = 10 * 1000
const TRANSAK_IFRAME_ID = 'credit-card-payment-transak-iframe'
const SARDINE_IFRAME_ID = 'credit-card-payment-sardine-iframe'

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
  const projectAccessKey = useProjectAccessKey()
  const { env } = useConfig()
  const disableSardineClientTokenFetch =
    isLoadingTokenMetadatas || isLoadingCurrencyInfo || isLoadingCollectionInfo || creditCardProvider !== 'sardine'
  const { transakApiUrl, sardineCheckoutUrl: sardineProxyUrl, transakApiKey: transakGlobalApiKey } = useEnvironmentContext()
  const network = findSupportedNetwork(chain)
  const error = errorCollectionInfo || errorTokenMetadata || errorCurrencyInfo
  const isLoading = isLoadingCollectionInfo || isLoadingTokenMetadatas || isLoadingCurrencyInfo
  const isNativeCurrency = compareAddress(currencyAddress, zeroAddress)
  const currencySymbol = isNativeCurrency ? network?.nativeToken.symbol : currencyInfo?.symbol || 'POL'
  const currencyDecimals = isNativeCurrency ? network?.nativeToken.decimals : currencyInfo?.decimals || 18
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const tokenMetadata = tokenMetadatas?.[0]

  const {
    data: dataClientToken,
    isLoading: isLoadingClientToken,
    error: errorClientToken
  } = useSardineClientToken(
    {
      order: {
        chainId: network?.chainId || 137,
        contractAddress: targetContractAddress,
        recipientAddress,
        currencyQuantity: totalPriceRaw,
        currencySymbol: currencyInfo?.symbol || 'POL',
        currencyDecimals: String(currencyDecimals || 18),
        currencyAddress,
        nftId: collectible.tokenId,
        nftAddress: collectionAddress,
        nftQuantity: collectible.quantity,
        nftDecimals: String(dataCollectionInfo?.decimals || 18),
        calldata: txData
      },
      projectAccessKey: projectAccessKey,
      apiClientUrl: env.apiUrl,
      tokenMetadata: tokenMetadata
    },
    disableSardineClientTokenFetch
  )

  const missingCreditCardProvider = !creditCardProvider
  const missingTransakConfig = !transakConfig && creditCardProvider === 'transak'
  const transakApiKey = transakConfig?.apiKey || transakGlobalApiKey

  if (missingCreditCardProvider || missingTransakConfig) {
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
    // Transak requires the recipient address to be the proxy address
    // so we need to replace the recipient address with the proxy address in the calldata
    // this is a weird hack so that credit card integrations are as simple as possible and should work 99% of the time
    // If an issue arises, the user can override the calldata in the transak settings

    const calldataWithProxy =
      transakConfig?.callDataOverride ??
      txData.replace(recipientAddress.toLowerCase().substring(2), TRANSAK_PROXY_ADDRESS.toLowerCase().substring(2))

    const pakoData = Array.from(pako.deflate(calldataWithProxy))

    const transakCallData = encodeURIComponent(btoa(String.fromCharCode.apply(null, pakoData)))

    const price = Number(formatUnits(BigInt(totalPriceRaw), Number(currencyDecimals || 18)))

    const transakNftDataJson = JSON.stringify([
      {
        imageURL: tokenMetadata?.image || '',
        nftName: tokenMetadata?.name || 'collectible',
        collectionAddress: collectionAddress,
        tokenID: [collectible.tokenId],
        price: [price],
        quantity: Number(collectible.quantity),
        nftType: dataCollectionInfo?.type || 'ERC721'
      }
    ])

    const transakNftData = encodeURIComponent(btoa(transakNftDataJson))

    const estimatedGasLimit = '500000'

    const partnerOrderId = `${recipientAddress}-${new Date().getTime()}`

    // Note: the network name might not always line up with Transak. A conversion function might be necessary
    const network = findSupportedNetwork(chain)
    const networkName = network?.name.toLowerCase()
    const transakLink = `${transakApiUrl}?apiKey=${transakApiKey}&isNFT=true&calldata=${transakCallData}&contractId=${transakConfig?.contractId}&cryptoCurrencyCode=${currencySymbol}&estimatedGasLimit=${estimatedGasLimit}&nftData=${transakNftData}&walletAddress=${recipientAddress}&disableWalletAddressForm=true&partnerOrderId=${partnerOrderId}&network=${networkName}`

    return {
      error: null,
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
      isLoading: false
    }
  }

  // Sardine credit card provider
  const sardineApiUrl = sardineProxyUrl.replace('checkout', 'api')
  const authToken = dataClientToken?.token
  const url = `${sardineProxyUrl}?api_url=${sardineApiUrl}&client_token=${authToken}&show_features=true`

  const isLoadingSardine = isLoadingClientToken || isLoading
  const errorSardine = errorClientToken || error

  const data = {
    iframeId: SARDINE_IFRAME_ID,
    paymentUrl: url,
    CreditCardIframe: () => (
      <div className="flex items-center justify-center" style={{ height: '770px' }}>
        <iframe
          id={SARDINE_IFRAME_ID}
          src={url}
          style={{
            maxHeight: '650px',
            height: '100%',
            maxWidth: '380px',
            width: '100%'
          }}
        />
      </div>
    ),
    EventListener: () => <SardineEventListener onSuccess={onSuccess} onError={onError} orderId={dataClientToken?.orderId || ''} />
  }

  return {
    error: errorSardine,
    isLoading: isLoadingSardine,
    data
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

interface SardineEventListenerProps {
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  orderId: string
}

const SardineEventListener = ({ onSuccess, onError, orderId }: SardineEventListenerProps) => {
  const { env } = useConfig()
  const projectAccessKey = useProjectAccessKey()

  const pollForOrderStatus = async () => {
    try {
      console.log('Polling for transaction status')
      const pollResponse = await fetchSardineOrderStatus(orderId, projectAccessKey, env.apiUrl)
      const status = pollResponse.resp.status
      const transactionHash = pollResponse.resp?.transactionHash

      console.log('transaction status poll response:', status)

      if (status === 'Complete') {
        onSuccess?.(transactionHash)
      }
      if (status === 'Declined' || status === 'Cancelled') {
        onError?.(new Error('Failed to transfer collectible'))
      }
    } catch (e) {
      console.error('An error occurred while fetching the transaction status')
      onError?.(e as Error)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      pollForOrderStatus()
    }, POLLING_TIME)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return null
}
