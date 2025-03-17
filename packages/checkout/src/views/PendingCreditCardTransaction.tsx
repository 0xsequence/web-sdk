import { useAnalyticsContext, useProjectAccessKey } from '@0xsequence/connect'
import { Spinner, Text } from '@0xsequence/design-system'
import { findSupportedNetwork } from '@0xsequence/network'
import { useConfig, useGetTokenMetadata, useGetContractInfo } from '@0xsequence/react-hooks'
import pako from 'pako'
import { useEffect } from 'react'
import { formatUnits } from 'viem'

import { fetchSardineOrderStatus } from '../api'
import { NFT_CHECKOUT_SOURCE } from '../constants'
import { TransactionPendingNavigation, useEnvironmentContext } from '../contexts'
import {
  useNavigation,
  useCheckoutModal,
  useSardineClientToken,
  useTransactionStatusModal,
  useSkipOnCloseCallback
} from '../hooks'
import { TRANSAK_PROXY_ADDRESS } from '../utils/transak'

const POLLING_TIME = 10 * 1000

interface PendingCreditTransactionProps {
  skipOnCloseCallback: () => void
}

export const PendingCreditCardTransaction = () => {
  const nav = useNavigation()
  const {
    params: {
      creditCardCheckout: { provider, onClose = () => {} }
    }
  } = nav.navigation as TransactionPendingNavigation

  const { skipOnCloseCallback } = useSkipOnCloseCallback(onClose)

  switch (provider) {
    case 'transak':
      return <PendingCreditCardTransactionTransak skipOnCloseCallback={skipOnCloseCallback} />
    case 'sardine':
    default:
      return <PendingCreditCardTransactionSardine skipOnCloseCallback={skipOnCloseCallback} />
  }
}

export const PendingCreditCardTransactionTransak = ({ skipOnCloseCallback }: PendingCreditTransactionProps) => {
  const { transakApiUrl } = useEnvironmentContext()
  const { analytics } = useAnalyticsContext()
  const { openTransactionStatusModal } = useTransactionStatusModal()
  const nav = useNavigation()
  const { settings, closeCheckout } = useCheckoutModal()

  const {
    params: { creditCardCheckout }
  } = nav.navigation as TransactionPendingNavigation

  const { setNavigation } = nav

  const {
    data: tokensMetadata,
    isLoading: isLoadingTokenMetadata,
    isError: isErrorTokenMetadata
  } = useGetTokenMetadata({
    chainID: String(creditCardCheckout.chainId),
    contractAddress: creditCardCheckout.nftAddress,
    tokenIDs: [creditCardCheckout.nftId]
  })
  const {
    data: collectionInfo,
    isLoading: isLoadingCollectionInfo,
    isError: isErrorCollectionInfo
  } = useGetContractInfo({
    chainID: String(creditCardCheckout.chainId),
    contractAddress: creditCardCheckout.nftAddress
  })

  const network = findSupportedNetwork(creditCardCheckout.chainId)

  const tokenMetadata = tokensMetadata ? tokensMetadata[0] : undefined

  const transakConfig = settings?.creditCardCheckout?.transakConfig

  // Transak requires the recipient address to be the proxy address
  // so we need to replace the recipient address with the proxy address in the calldata
  // this is a weird hack so that credit card integrations are as simple as possible and should work 99% of the time
  // If an issue arises, the user can override the calldata in the transak settings

  const calldataWithProxy =
    transakConfig?.callDataOverride ??
    creditCardCheckout.calldata.replace(
      creditCardCheckout.recipientAddress.toLowerCase().substring(2),
      TRANSAK_PROXY_ADDRESS.toLowerCase().substring(2)
    )

  const pakoData = Array.from(pako.deflate(calldataWithProxy))

  const transakCallData = encodeURIComponent(btoa(String.fromCharCode.apply(null, pakoData)))

  const price = Number(formatUnits(BigInt(creditCardCheckout.currencyQuantity), Number(creditCardCheckout.currencyDecimals)))

  const transakNftDataJson = JSON.stringify([
    {
      imageURL: tokenMetadata?.image || '',
      nftName: tokenMetadata?.name || 'collectible',
      collectionAddress: creditCardCheckout.nftAddress,
      tokenID: [creditCardCheckout.nftId],
      price: [price],
      quantity: Number(creditCardCheckout.nftQuantity),
      nftType: collectionInfo?.type || 'ERC721'
    }
  ])

  console.log('transakNftDataJson', JSON.parse(transakNftDataJson))
  const transakNftData = encodeURIComponent(btoa(transakNftDataJson))

  const estimatedGasLimit = '500000'

  const partnerOrderId = `${creditCardCheckout.recipientAddress}-${new Date().getTime()}`

  // Note: the network name might not always line up with Transak. A conversion function might be necessary
  const networkName = network?.name.toLowerCase()

  const transakLink = `${transakApiUrl}?apiKey=${transakConfig?.apiKey}&isNFT=true&calldata=${transakCallData}&contractId=${transakConfig?.contractId}&cryptoCurrencyCode=${creditCardCheckout.currencySymbol}&estimatedGasLimit=${estimatedGasLimit}&nftData=${transakNftData}&walletAddress=${creditCardCheckout.recipientAddress}&disableWalletAddressForm=true&partnerOrderId=${partnerOrderId}&network=${networkName}`

  const isLoading = isLoadingTokenMetadata || isLoadingCollectionInfo
  const isError = isErrorTokenMetadata || isErrorCollectionInfo

  useEffect(() => {
    const transakIframeElement = document.getElementById('transakIframe') as HTMLIFrameElement
    if (!transakIframeElement) {
      return
    }
    const transakIframe = transakIframeElement.contentWindow

    const readMessage = (message: any) => {
      if (message.source !== transakIframe) {
        return
      }

      if (message?.data?.event_id === 'TRANSAK_ORDER_SUCCESSFUL' && message?.data?.data?.status === 'COMPLETED') {
        console.log('Order Data: ', message?.data?.data)
        const txHash = message?.data?.data?.transactionHash || ''

        skipOnCloseCallback()

        analytics?.track({
          event: 'SEND_TRANSACTION_REQUEST',
          props: {
            ...creditCardCheckout.supplementaryAnalyticsInfo,
            type: 'credit_card',
            provider: 'transak',
            source: NFT_CHECKOUT_SOURCE,
            chainId: String(creditCardCheckout.chainId),
            listedCurrency: creditCardCheckout.currencyAddress,
            purchasedCurrency: creditCardCheckout.currencyAddress,
            origin: window.location.origin,
            from: creditCardCheckout.recipientAddress,
            to: creditCardCheckout.contractAddress,
            item_ids: JSON.stringify([creditCardCheckout.nftId]),
            item_quantities: JSON.stringify([JSON.stringify([creditCardCheckout.nftQuantity])]),
            txHash
          }
        })

        closeCheckout()
        openTransactionStatusModal({
          chainId: creditCardCheckout.chainId,
          currencyAddress: creditCardCheckout.currencyAddress,
          collectionAddress: creditCardCheckout.nftAddress,
          txHash: txHash,
          items: [
            {
              tokenId: creditCardCheckout.nftId,
              quantity: creditCardCheckout.nftQuantity,
              decimals: creditCardCheckout.nftDecimals === undefined ? undefined : Number(creditCardCheckout.nftDecimals),
              price: creditCardCheckout.currencyQuantity
            }
          ],
          onSuccess: () => {
            if (creditCardCheckout.onSuccess) {
              creditCardCheckout.onSuccess(txHash, creditCardCheckout)
            }
          },
          onClose: creditCardCheckout?.onClose
        })
        return
      }

      if (message?.data?.event_id === 'TRANSAK_ORDER_FAILED') {
        setNavigation({
          location: 'transaction-error',
          params: {
            error: new Error('Transak transaction failed')
          }
        })
      }
    }

    window.addEventListener('message', readMessage)

    return () => window.removeEventListener('message', readMessage)
  }, [isLoading])

  if (isError || !transakConfig) {
    return (
      <div
        className="flex flex-col justify-center items-center gap-6"
        style={{
          height: '650px',
          width: '380px'
        }}
      >
        <div>
          {!transakConfig ? (
            <Text color="primary">Error: No Transak configuration found</Text>
          ) : (
            <Text color="primary">An error has occurred</Text>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        className="flex flex-col justify-center items-center gap-6"
        style={{
          height: '650px',
          width: '380px'
        }}
      >
        <div>
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center" style={{ height: '770px' }}>
      <iframe
        id="transakIframe"
        allow="camera;microphone;payment"
        src={transakLink}
        style={{
          maxHeight: '650px',
          height: '100%',
          maxWidth: '380px',
          width: '100%'
        }}
      />
    </div>
  )
}

export const PendingCreditCardTransactionSardine = ({ skipOnCloseCallback }: PendingCreditTransactionProps) => {
  const { analytics } = useAnalyticsContext()
  const { openTransactionStatusModal } = useTransactionStatusModal()
  const nav = useNavigation()
  const { closeCheckout } = useCheckoutModal()
  const { sardineApiUrl: sardineProxyUrl } = useEnvironmentContext()
  const { env } = useConfig()
  const {
    params: { creditCardCheckout }
  } = nav.navigation as TransactionPendingNavigation
  const { setNavigation } = nav
  const projectAccessKey = useProjectAccessKey()

  const { data: tokensMetadata, isLoading: isLoadingTokenMetadata } = useGetTokenMetadata({
    chainID: String(creditCardCheckout.chainId),
    contractAddress: creditCardCheckout.nftAddress,
    tokenIDs: [creditCardCheckout.nftId]
  })
  const tokenMetadata = tokensMetadata ? tokensMetadata[0] : undefined

  const disableSardineClientTokenFetch = isLoadingTokenMetadata

  const { data, isLoading, isError } = useSardineClientToken(
    {
      order: creditCardCheckout,
      projectAccessKey: projectAccessKey,
      apiClientUrl: env.apiUrl,
      tokenMetadata: tokenMetadata
    },
    disableSardineClientTokenFetch
  )

  const authToken = data?.token

  const sardineApiUrl = sardineProxyUrl.replace('checkout', 'api')

  const url = `${sardineProxyUrl}?api_url=${sardineApiUrl}&client_token=${authToken}&show_features=true`

  const pollForOrderStatus = async () => {
    try {
      if (!data) {
        return
      }

      const { orderId } = data

      console.log('Polling for transaction status')
      const pollResponse = await fetchSardineOrderStatus(orderId, projectAccessKey, env.apiUrl)
      const status = pollResponse.resp.status
      const transactionHash = pollResponse.resp?.transactionHash

      console.log('transaction status poll response:', status)

      if (status === 'Draft') {
        return
      }
      if (status === 'Complete') {
        skipOnCloseCallback()

        analytics?.track({
          event: 'SEND_TRANSACTION_REQUEST',
          props: {
            ...creditCardCheckout.supplementaryAnalyticsInfo,
            type: 'credit_card',
            provider: 'sardine',
            source: NFT_CHECKOUT_SOURCE,
            chainId: String(creditCardCheckout.chainId),
            listedCurrency: creditCardCheckout.currencyAddress,
            purchasedCurrency: creditCardCheckout.currencyAddress,
            origin: window.location.origin,
            from: creditCardCheckout.recipientAddress,
            to: creditCardCheckout.contractAddress,
            item_ids: JSON.stringify([creditCardCheckout.nftId]),
            item_quantities: JSON.stringify([JSON.stringify([creditCardCheckout.nftQuantity])]),
            txHash: transactionHash
          }
        })

        closeCheckout()
        openTransactionStatusModal({
          chainId: creditCardCheckout.chainId,
          currencyAddress: creditCardCheckout.currencyAddress,
          collectionAddress: creditCardCheckout.nftAddress,
          txHash: transactionHash,
          items: [
            {
              tokenId: creditCardCheckout.nftId,
              quantity: creditCardCheckout.nftQuantity,
              decimals: creditCardCheckout.nftDecimals === undefined ? undefined : Number(creditCardCheckout.nftDecimals),
              price: creditCardCheckout.currencyQuantity
            }
          ],
          onSuccess: () => {
            if (creditCardCheckout.onSuccess) {
              creditCardCheckout.onSuccess(transactionHash, creditCardCheckout)
            }
          },
          onClose: creditCardCheckout?.onClose
        })
        return
      }
      if (status === 'Declined' || status === 'Cancelled') {
        setNavigation({
          location: 'transaction-error',
          params: {
            error: new Error('Failed to transfer collectible')
          }
        })
        return
      }
    } catch (e) {
      console.error('An error occurred while fetching the transaction status')
      setNavigation({
        location: 'transaction-error',
        params: {
          error: e as Error
        }
      })
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      pollForOrderStatus()
    }, POLLING_TIME)

    return () => {
      clearInterval(interval)
    }
  }, [isLoading])

  if (isError) {
    return (
      <div
        className="flex flex-col justify-center items-center gap-6"
        style={{
          height: '650px',
          width: '380px'
        }}
      >
        <div>
          <Text color="primary">An error has occurred</Text>
        </div>
      </div>
    )
  }

  if (isLoading || !authToken) {
    return (
      <div
        className="flex flex-col justify-center items-center gap-6"
        style={{
          height: '650px',
          width: '380px'
        }}
      >
        <div>
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center" style={{ height: '770px' }}>
      <iframe
        src={url}
        style={{
          maxHeight: '650px',
          height: '100%',
          maxWidth: '380px',
          width: '100%'
        }}
      />
    </div>
  )
}
