import type { SequenceAPIClient } from '@0xsequence/api'
import type { TokenMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork, networks, type ChainId } from '@0xsequence/network'

import type { CreditCardCheckout } from '../contexts/CheckoutModal.js'

export interface FetchSardineClientTokenReturn {
  token: string
  orderId: string
}

export interface MethodArguments {
  [key: string]: any
}

export interface FetchSardineClientTokenArgs {
  order: CreditCardCheckout
  projectAccessKey: string
  apiClientUrl: string
  tokenMetadata?: TokenMetadata
}

export const fetchSardineClientToken = async ({
  order,
  projectAccessKey,
  tokenMetadata,
  apiClientUrl
}: FetchSardineClientTokenArgs): Promise<FetchSardineClientTokenReturn> => {
  // Test credentials: https://docs.sardine.ai/docs/integrate-payments/nft-checkout-testing-credentials
  const url = `${apiClientUrl}/rpc/API/SardineGetNFTCheckoutToken`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': projectAccessKey
    },
    body: JSON.stringify({
      params: {
        name: tokenMetadata?.name || 'Unknown',
        imageUrl: tokenMetadata?.image || 'https://sequence.market/images/placeholder.png',
        network: networks[order.chainId as ChainId].name,
        recipientAddress: order.recipientAddress,
        contractAddress: order.contractAddress,
        platform: 'calldata_execution',
        blockchainNftId: order.nftId,
        quantity: Number(order.nftQuantity),
        decimals: Number(order?.nftDecimals || 0),
        tokenAmount: order.currencyQuantity,
        tokenAddress: order.currencyAddress,
        tokenSymbol: order.currencySymbol,
        tokenDecimals: Number(order.currencyDecimals),
        callData: order.calldata,
        ...(order?.approvedSpenderAddress ? { approvedSpenderAddress: order.approvedSpenderAddress } : {})
      }
    })
  })

  const {
    resp: { orderId, token }
  } = await res.json()

  return {
    token,
    orderId
  }
}

export const fetchSardineOrderStatus = async (orderId: string, projectAccessKey: string, apiClientBaseUrl: string) => {
  // Test credentials: https://docs.sardine.ai/docs/integrate-payments/nft-checkout-testing-credentials
  const url = `${apiClientBaseUrl}/rpc/API/SardineGetNFTCheckoutOrderStatus`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': `${projectAccessKey}`
    },
    body: JSON.stringify({
      orderId
    })
  })

  const json = await response.json()
  console.log('json:', json)
  return json
}

export interface Country {
  code: string
}

export const fetchSupportedCountryCodes = async (): Promise<Country[]> => {
  // Can also be fetches from sardine api
  const supportedCountries = [
    'AL',
    'AO',
    'AT',
    'BB',
    'BE',
    'BZ',
    'BJ',
    'BO',
    'BR',
    'BG',
    'KH',
    'KY',
    'CL',
    'CO',
    'KM',
    'CR',
    'HR',
    'CY',
    'CZ',
    'DK',
    'DM',
    'DO',
    'EC',
    'EG',
    'SV',
    'GQ',
    'EE',
    'FO',
    'FI',
    'FR',
    'GF',
    'DE',
    'GR',
    'GN',
    'GW',
    'GY',
    'HT',
    'HN',
    'HU',
    'IS',
    'ID',
    'IE',
    'IL',
    'IT',
    'JM',
    'JP',
    'KG',
    'LA',
    'LV',
    'LI',
    'LT',
    'LU',
    'MG',
    'MY',
    'MV',
    'MT',
    'MR',
    'MX',
    'MN',
    'MZ',
    'NL',
    'NO',
    'OM',
    'PA',
    'PY',
    'PE',
    'PH',
    'PL',
    'PT',
    'RO',
    'KN',
    'MF',
    'SA',
    'SC',
    'SG',
    'SK',
    'SI',
    'KR',
    'ES',
    'LK',
    'SE',
    'CH',
    'TZ',
    'TH',
    'TT',
    'TR',
    'AE',
    'GB',
    'UY',
    'UZ',
    'VU',
    'VN'
  ]

  return supportedCountries.map(countryCode => ({ code: countryCode }))
}

export interface SardineLinkOnRampArgs {
  sardineOnRampUrl: string
  apiClient: SequenceAPIClient
  walletAddress: string
  currencyCode?: string
  fundingAmount?: string
  network?: string
}

export const fetchSardineOnRampLink = async ({
  sardineOnRampUrl,
  apiClient,
  walletAddress,
  currencyCode,
  fundingAmount,
  network
}: SardineLinkOnRampArgs) => {
  const response = await apiClient.sardineGetClientToken()

  interface SardineOptions {
    client_token: string
    address: string
    fiat_amount?: string
    asset_type?: string
    network?: string
  }

  const options: SardineOptions = {
    client_token: response.token,
    address: walletAddress,
    fiat_amount: fundingAmount,
    asset_type: currencyCode,
    network
  }

  const url = new URL(sardineOnRampUrl)
  Object.keys(options).forEach(k => {
    if (options[k as keyof SardineOptions] !== undefined) {
      url.searchParams.append(k, options[k as keyof SardineOptions] as string)
    }
  })

  return url.href
}

export interface FetchForteAccessTokenReturn {
  accessToken: string
  expiresIn: number
  tokenType: string
}

export const fetchForteAccessToken = async (forteApiUrl: string): Promise<FetchForteAccessTokenReturn> => {
  const clientId = '5tpnj5869vs3jpgtpif2ci8v08'
  const clientSecret = 'jpkbg3e2ho9rbd0959qe5l6ke238d4bca2nptstfga2i9hant5e'

  const url = `${forteApiUrl}/auth/v1/oauth2/token`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret
    })
  })

  const { data } = await res.json()

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type
  }
}

export interface CreateFortePaymentIntentArgs {
  accessToken: string
  tokenType: string
  nonce: string
  nftQuantity: string
  recipientAddress: string
  chainId: string
  signature: string
  tokenAddress: string
  protocolAddress: string
  nftName: string
  imageUrl: string
  tokenId: string
}

export interface CreateFortePaymentIntentReturn {
  errorCode: string | null
  flow: string
  notes: string[]
  paymentIntentId: string
  widgetData: string
}

export const createFortePaymentIntent = async (
  forteApiUrl: string,
  args: CreateFortePaymentIntentArgs
): Promise<CreateFortePaymentIntentReturn> => {
  const {
    accessToken,
    tokenType,
    recipientAddress,
    chainId,
    signature,
    protocolAddress,
    nftName,
    nftQuantity,
    imageUrl,
    tokenId,
    nonce
  } = args
  const network = findSupportedNetwork(chainId)

  if (!network) {
    throw new Error('Invalid chainId')
  }

  const url = `${forteApiUrl}/payments/v2/intent`
  const forteBlockchainName = network.name.toLowerCase().replace('-', '_')
  const idempotencyKey = `${recipientAddress}-${tokenId}-${protocolAddress}-${nftName}-${new Date().getTime()}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${tokenType} ${accessToken}`
    },
    body: JSON.stringify({
      blockchain: forteBlockchainName,
      currency: 'USD',
      idempotency_key: idempotencyKey,
      transaction_type: 'BUY_NFT_MINT',
      buyer: {
        id: recipientAddress,
        wallet: {
          address: recipientAddress,
          blockchain: forteBlockchainName
        }
      },
      items: [
        {
          name: nftName,
          quantity: nftQuantity,
          price: {
            amount: nftQuantity,
            image_url: imageUrl,
            title: nftName,
            mint_data: {
              nonce,
              signature: signature,
              token_ids: [tokenId],
              protocol_address: protocolAddress,
              protocol: 'protocol-mint'
            }
          }
        }
      ]
    })
  })

  const {
    data: { error_code, flow, notes, payment_intent_id, widget_data }
  } = await res.json()

  return {
    errorCode: error_code,
    flow,
    notes,
    paymentIntentId: payment_intent_id,
    widgetData: widget_data
  }
}
