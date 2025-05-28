import type { SequenceAPIClient } from '@0xsequence/api'
import type { TokenMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork, networks, type ChainId } from '@0xsequence/network'
import { zeroAddress } from 'viem'

import {
  type CreditCardCheckout,
  type ForteProtocolType,
  type ForteConfig,
  type ForteMintConfig,
  type ForteSeaportConfig,
  type ForteMagicedenConfig
} from '../contexts/index.js'

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
  const clientId = 'l5cnnjctaugcn7b7rg0fglpk'
  const clientSecret = '1l9acapjnrclfl4ld5po6vcquicch2v7jdn6v1249cht9uu878t4'

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
  nftQuantity: string
  recipientAddress: string
  chainId: string
  signature?: string
  nftAddress: string
  currencyAddress: string
  targetContractAddress: string
  nftName: string
  imageUrl: string
  tokenId?: string
  currencyQuantity: string
  protocolConfig: ForteConfig
  calldata: string
}

const forteCurrencyMap: { [chainId: string]: { [currencyAddress: string]: string } } = {
  '1': {
    [zeroAddress]: 'ETH',
    ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'.toLowerCase()]: 'USDC_ETH'
  },
  '137': {
    [zeroAddress]: 'POL',
    ['0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'.toLowerCase()]: 'USDC_POLYGON'
  },
  '8453': {
    [zeroAddress]: 'BASE_ETH'
  }
}

const getForteCurrency = (chainId: string, currencyAddress: string) => {
  return forteCurrencyMap[chainId]?.[currencyAddress.toLowerCase()] || 'ETH'
}

export const createFortePaymentIntent = async (forteApiUrl: string, args: CreateFortePaymentIntentArgs): Promise<any> => {
  const {
    accessToken,
    tokenType,
    recipientAddress,
    chainId,
    calldata,
    targetContractAddress,
    nftName,
    nftAddress,
    nftQuantity,
    imageUrl,
    tokenId,
    protocolConfig,
    currencyAddress,
    currencyQuantity
  } = args

  const network = findSupportedNetwork(chainId)

  if (!network) {
    throw new Error('Invalid chainId')
  }

  const url = `${forteApiUrl}/payments/v2/intent`
  const forteBlockchainName = network.name.toLowerCase().replace('-', '_')
  const idempotencyKey = `${recipientAddress}-${tokenId}-${targetContractAddress}-${nftName}-${new Date().getTime()}`

  let body: { [key: string]: any } = {
    blockchain: forteBlockchainName,
    idempotency_key: idempotencyKey,
    buyer: {
      id: recipientAddress,
      wallet: {
        address: recipientAddress,
        blockchain: forteBlockchainName
      }
    }
  }

  if (protocolConfig.protocol == 'mint') {
    body = {
      ...body,
      transaction_type: 'BUY_NFT_MINT',
      currency: getForteCurrency(chainId, currencyAddress),
      items: [
        {
          amount: nftQuantity,
          image_url: imageUrl,
          title: nftName,
          mint_data: {
            token_contract_address: nftAddress,
            token_ids: tokenId ? [tokenId] : [],
            protocol_address: targetContractAddress,
            protocol: 'custom_evm_call',
            calldata
          }
        }
      ]
    }
  } else {
    let listingData: { [key: string]: any } = {}

    if (protocolConfig.protocol == 'seaport') {
      listingData = {
        protocol: protocolConfig.protocol,
        order_hash: protocolConfig.orderHash,
        protocol_address: protocolConfig.seaportProtocolAddress
      }
    } else if (protocolConfig.protocol == 'magiceden') {
      listingData = {
        protocol: protocolConfig.protocol,
        auction_house: targetContractAddress,
        token_address: nftAddress
      }
    } else if (protocolConfig.protocol == 'custom_evm_call') {
      listingData = {
        protocol: protocolConfig.protocol,
        calldata: protocolConfig.calldata,
        protocol_address: targetContractAddress
      }
    }

    body = {
      ...body,
      transaction_type: 'BUY_NFT',
      currency: getForteCurrency(chainId, currencyAddress),
      items: [
        {
          amount: currencyQuantity,
          id: '1',
          image_url: imageUrl,
          listing_data: listingData,
          nft_data: {
            contract_address: nftAddress,
            token_id: tokenId
          },
          title: nftName
        }
      ],
      seller: {
        wallet: {
          address: protocolConfig.sellerAddress || '',
          blockchain: forteBlockchainName
        }
      }
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${tokenType} ${accessToken}`
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch widget data, with status: ${res.status}`)
  }

  const data = await res.json()

  return data.data
}

export interface FetchFortePaymentStatusArgs {
  accessToken: string
  tokenType: string
  paymentIntentId: string
}

export type FortePaymentStatus = 'Expired' | 'Created' | 'Declined' | 'Approved'

export interface FetchFortePaymentStatusReturn {
  status: FortePaymentStatus
}

export const fetchFortePaymentStatus = async (
  forteApiUrl: string,
  args: FetchFortePaymentStatusArgs
): Promise<FetchFortePaymentStatusReturn> => {
  const { accessToken, tokenType, paymentIntentId } = args

  const url = `${forteApiUrl}/payments/v1/payments/statuses`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${tokenType} ${accessToken}`
    },
    body: JSON.stringify({
      payment_intent_ids: [paymentIntentId]
    })
  })

  const { data } = await res.json()

  return {
    status: (data[0]?.status as FortePaymentStatus) || ''
  }
}
