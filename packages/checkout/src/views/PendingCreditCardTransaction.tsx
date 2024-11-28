import { Box, Spinner, Text } from '@0xsequence/design-system'
import { useProjectAccessKey, useContractInfo, useTokenMetadata } from '@0xsequence/kit'
import pako from 'pako'
import React, { useEffect } from 'react'
import { formatUnits, parseUnits } from 'viem'

import { fetchSardineOrderStatus } from '../api'
import { TransactionPendingNavigation } from '../contexts'
import { useNavigation, useCheckoutModal, useSardineClientToken, useTransactionStatusModal } from '../hooks'

const POLLING_TIME = 10 * 1000

export const PendingCreditCardTransaction = () => {
  const nav = useNavigation()
  const {
    params: {
      creditCardCheckout: { provider }
    }
  } = nav.navigation as TransactionPendingNavigation

  switch (provider) {
    case 'transak':
      return <PendingCreditCardTransactionSardine />
    case 'sardine':
    default:
      return <PendingCreditCardTransactionSardine />
  }
}

export const PendingCreditCardTransactionTransak = () => {
  const { openTransactionStatusModal } = useTransactionStatusModal()
  const nav = useNavigation()
  const { settings, closeCheckout } = useCheckoutModal()

  const {
    params: { creditCardCheckout }
  } = nav.navigation as TransactionPendingNavigation

  const { setNavigation } = nav
  const projectAccessKey = useProjectAccessKey()

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

  const tokenMetadata = tokensMetadata ? tokensMetadata[0] : undefined

  const transakConfig = settings?.creditCardCheckout?.transakConfig

  const baseUrl = creditCardCheckout.isDev ? 'https://global-stg.transak.com' : 'https://global.transak.com'

  const pakoData = Array.from(pako.deflate(creditCardCheckout.calldata))

  const transakCallData = encodeURIComponent(btoa(String.fromCharCode.apply(null, pakoData)))

  const price = Number(formatUnits(BigInt(creditCardCheckout.currencyQuantity), Number(creditCardCheckout.currencyDecimals)))
  const formattedQuantity = Number(creditCardCheckout.currencyQuantity)

  const transakNftDataJson = JSON.stringify([
    {
      imageURL: tokenMetadata?.image || '',
      nftName: tokenMetadata?.name || 'collectible',
      collectionAddress: creditCardCheckout.nftAddress,
      tokenID: [creditCardCheckout.nftId],
      price: [price],
      quantity: formattedQuantity,
      nftType: collectionInfo?.type || 'ERC721'
    }
  ])

  const transakNftData = encodeURIComponent(btoa(transakNftDataJson))

  const estimatedGasLimit = '500000'

  const partnerOrderId = `${creditCardCheckout.recipientAddress}-${new Date().getTime()}`

  const transakLink = `${baseUrl}?apiKey=${transakConfig?.apiKey}&isNFT=true&calldata=${transakCallData}&contractId=${transakConfig?.contractId}&cryptoCurrencyCode=${creditCardCheckout.currencySymbol}&estimatedGasLimit=${estimatedGasLimit}&nftData=${transakNftData}&walletAddress=${creditCardCheckout.recipientAddress}&disableWalletAddressForm=true&partnerOrderId=${partnerOrderId}`

  const isLoading = isLoadingTokenMetadata
  const isError = isErrorTokenMetadata

  useEffect(() => {
    const transakIframeElement = document.getElementById('transakIframe') as HTMLIFrameElement
    const transakIframe = transakIframeElement.contentWindow

    const readMessage = (message: any) => {
      if (message.source !== transakIframe) return

      if (message?.data?.event_id === 'TRANSAK_ORDER_SUCCESSFUL') {
        console.log('Order Data: ', message?.data?.data)
        const txHash = message?.data?.data?.transactionHash || ''

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
          }
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

export const PendingCreditCardTransactionSardine = () => {
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
          }
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
