import { Box, Spinner, Text } from '@0xsequence/design-system'
import { useProjectAccessKey, useContractInfo, useTokenMetadata } from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'
import pako from 'pako'
import { useEffect } from 'react'
import { formatUnits } from 'viem'

import { fetchSardineOrderStatus } from '../api'
import { TransactionPendingNavigation } from '../contexts'
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
  } = useTokenMetadata(creditCardCheckout.chainId, creditCardCheckout.nftAddress, [creditCardCheckout.nftId])
  const {
    data: collectionInfo,
    isLoading: isLoadingCollectionInfo,
    isError: isErrorCollectionInfo
  } = useContractInfo(creditCardCheckout.chainId, creditCardCheckout.nftAddress)

  const network = findSupportedNetwork(creditCardCheckout.chainId)

  const tokenMetadata = tokensMetadata ? tokensMetadata[0] : undefined

  const transakConfig = settings?.creditCardCheckout?.transakConfig

  const baseUrl = creditCardCheckout.isDev ? 'https://global-stg.transak.com' : 'https://global.transak.com'

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

  const transakLink = `${baseUrl}?apiKey=${transakConfig?.apiKey}&isNFT=true&calldata=${transakCallData}&contractId=${transakConfig?.contractId}&cryptoCurrencyCode=${creditCardCheckout.currencySymbol}&estimatedGasLimit=${estimatedGasLimit}&nftData=${transakNftData}&walletAddress=${creditCardCheckout.recipientAddress}&disableWalletAddressForm=true&partnerOrderId=${partnerOrderId}&network=${networkName}`

  const isLoading = isLoadingTokenMetadata || isLoadingCollectionInfo
  const isError = isErrorTokenMetadata || isErrorCollectionInfo

  useEffect(() => {
    const transakIframeElement = document.getElementById('transakIframe') as HTMLIFrameElement
    const transakIframe = transakIframeElement.contentWindow

    const readMessage = (message: any) => {
      if (message.source !== transakIframe) return

      if (message?.data?.event_id === 'TRANSAK_ORDER_SUCCESSFUL' && message?.data?.data?.status === 'COMPLETED') {
        console.log('Order Data: ', message?.data?.data)
        const txHash = message?.data?.data?.transactionHash || ''

        skipOnCloseCallback()
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
      <Box
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap="6"
        style={{
          height: '650px',
          width: '380px'
        }}
      >
        <Box>
          {!transakConfig ? (
            <Text color="text100">Error: No Transak configuration found</Text>
          ) : (
            <Text color="text100">An error has occurred</Text>
          )}
        </Box>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap="6"
        style={{
          height: '650px',
          width: '380px'
        }}
      >
        <Box>
          <Spinner size="lg" />
        </Box>
      </Box>
    )
  }

  return (
    <Box alignItems="center" justifyContent="center" style={{ height: '770px' }}>
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
    </Box>
  )
}

export const PendingCreditCardTransactionSardine = ({ skipOnCloseCallback }: PendingCreditTransactionProps) => {
  const { openTransactionStatusModal } = useTransactionStatusModal()
  const nav = useNavigation()
  const { settings, closeCheckout } = useCheckoutModal()

  const {
    params: { creditCardCheckout }
  } = nav.navigation as TransactionPendingNavigation
  const { setNavigation } = nav
  const projectAccessKey = useProjectAccessKey()

  const { data: tokensMetadata, isLoading: isLoadingTokenMetadata } = useTokenMetadata(
    creditCardCheckout.chainId,
    creditCardCheckout.nftAddress,
    [creditCardCheckout.nftId]
  )
  const tokenMetadata = tokensMetadata ? tokensMetadata[0] : undefined

  const isDev = settings?.creditCardCheckout?.isDev || false

  const disableSardineClientTokenFetch = isLoadingTokenMetadata

  const { data, isLoading, isError } = useSardineClientToken(
    {
      order: creditCardCheckout,
      isDev,
      projectAccessKey: projectAccessKey,
      tokenMetadata: tokenMetadata
    },
    disableSardineClientTokenFetch
  )

  const authToken = data?.token

  const url = isDev
    ? `https://sardine-checkout-sandbox.sequence.info?api_url=https://sardine-api-sandbox.sequence.info&client_token=${authToken}&show_features=true`
    : `https://sardine-checkout.sequence.info?api_url=https://sardine-api.sequence.info&client_token=${authToken}&show_features=true`

  const pollForOrderStatus = async () => {
    try {
      if (!data) {
        return
      }

      const { orderId } = data

      console.log('Polling for transaction status')
      const isDev = creditCardCheckout?.isDev || false

      const pollResponse = await fetchSardineOrderStatus(orderId, isDev, projectAccessKey)
      const status = pollResponse.resp.status
      const transactionHash = pollResponse.resp?.transactionHash

      console.log('transaction status poll response:', status)

      if (status === 'Draft') {
        return
      }
      if (status === 'Complete') {
        skipOnCloseCallback()
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
        setNavigation &&
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
      setNavigation &&
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
      <Box
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap="6"
        style={{
          height: '650px',
          width: '380px'
        }}
      >
        <Box>
          <Text color="text100">An error has occurred</Text>
        </Box>
      </Box>
    )
  }

  if (isLoading || !authToken) {
    return (
      <Box
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap="6"
        style={{
          height: '650px',
          width: '380px'
        }}
      >
        <Box>
          <Spinner size="lg" />
        </Box>
      </Box>
    )
  }

  return (
    <Box alignItems="center" justifyContent="center" style={{ height: '770px' }}>
      <iframe
        src={url}
        style={{
          maxHeight: '650px',
          height: '100%',
          maxWidth: '380px',
          width: '100%'
        }}
      />
    </Box>
  )
}
