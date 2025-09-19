import type { SequenceAPIClient } from '@0xsequence/api'
import type { TokenMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork, networks, ChainId as Chains, type ChainId } from '@0xsequence/network'
import { zeroAddress } from 'viem'

import { type CreditCardCheckout, type ForteConfig, type StructuredCalldata } from '../contexts/index.js'

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
  const clientId = ''
  const clientSecret = ''

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
  recipientAddress: string
  chainId: string
  signature?: string
  nftAddress: string
  currencyAddress: string
  currencySymbol: string
  targetContractAddress: string
  nftName: string
  imageUrl: string
  tokenId?: string
  currencyQuantity: string
  protocolConfig: ForteConfig
  calldata: string | StructuredCalldata
  approvedSpenderAddress?: string
}

const forteCurrencyMap: { [chainId: string]: { [currencyAddress: string]: string } } = {
  [Chains.MAINNET]: {
    [zeroAddress]: 'ETH',
    ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'.toLowerCase()]: 'USDC_ETH'
  },
  [Chains.POLYGON]: {
    [zeroAddress]: 'POL',
    ['0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'.toLowerCase()]: 'USDC_POLYGON'
  },
  [Chains.BASE]: {
    [zeroAddress]: 'BASE_ETH'
  },
  [Chains.SEPOLIA]: {
    [zeroAddress]: 'ETH',
    ['0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'.toLowerCase()]: 'WETH'
  }
}

const getForteCurrency = (chainId: string, currencyAddress: string, defaultCurrencySymbol: string) => {
  return forteCurrencyMap[chainId]?.[currencyAddress.toLowerCase()] || defaultCurrencySymbol
}

export const createFortePaymentIntent = async (
  sequenceApiUrl: string,
  projectAccessKey: string,
  args: CreateFortePaymentIntentArgs
): Promise<any> => {
  const {
    recipientAddress,
    chainId,
    calldata,
    targetContractAddress,
    nftName,
    nftAddress,
    imageUrl,
    tokenId,
    protocolConfig,
    currencyAddress,
    currencySymbol,
    currencyQuantity,
    approvedSpenderAddress
  } = args

  const network = findSupportedNetwork(chainId)

  if (!network) {
    throw new Error('Invalid chainId')
  }

  const url = `${sequenceApiUrl}/rpc/API/FortePayCreateIntent`
  const forteBlockchainName = network.name.toLowerCase().replace('-', '_')
  const idempotencyKey = `${recipientAddress}-${tokenId}-${targetContractAddress}-${nftName}-${new Date().getTime()}`

  let intent: { [key: string]: any } = {
    blockchain: forteBlockchainName,
    idempotencyKey: idempotencyKey,
    buyer: {
      id: recipientAddress,
      wallet: {
        address: recipientAddress,
        blockchain: forteBlockchainName
      }
    }
  }

  if (protocolConfig.protocol == 'mint') {
    intent = {
      ...intent,
      transactionType: 'BUY_NFT_MINT',
      currency: getForteCurrency(chainId, currencyAddress, currencySymbol),
      seller: {
        wallet: {
          address: protocolConfig.sellerAddress.toLowerCase(),
          blockchain: forteBlockchainName
        }
      },
      items: [
        {
          id: '1',
          amount: currencyQuantity,
          imageUrl: imageUrl,
          title: nftName,
          mintData: {
            ...(approvedSpenderAddress ? { payToAddress: approvedSpenderAddress.toLowerCase() } : {}),
            tokenContractAddress: nftAddress.toLowerCase(),
            tokenIds: tokenId ? [tokenId] : [],
            protocolAddress: targetContractAddress.toLowerCase(),
            protocol: 'custom_evm_call',
            ...(typeof calldata === 'string'
              ? {
                  calldata: calldata
                }
              : {
                  structuredCalldata: {
                    function_name: calldata.functionName,
                    arguments: calldata.arguments
                  }
                })
          }
        }
      ]
    }
  } else {
    let listingData: { [key: string]: any } = {}

    if (protocolConfig.protocol == 'custom_evm_call') {
      listingData = {
        ...(approvedSpenderAddress ? { payToAddress: approvedSpenderAddress.toLowerCase() } : {}),
        protocol: protocolConfig.protocol,
        protocolAddress: targetContractAddress.toLowerCase(),
        ...(typeof protocolConfig.calldata === 'string'
          ? { calldata: protocolConfig.calldata }
          : {
              structuredCalldata: {
                function_name: protocolConfig.calldata.functionName,
                arguments: protocolConfig.calldata.arguments
              }
            })
      }
    }

    intent = {
      ...intent,
      transactionType: 'BUY_NFT',
      currency: getForteCurrency(chainId, currencyAddress, currencySymbol),
      items: [
        {
          amount: currencyQuantity,
          id: '1',
          imageUrl: imageUrl,
          listingData: listingData,
          nftData: {
            contractAddress: nftAddress.toLowerCase(),
            tokenId: tokenId
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
      'X-Access-Key': projectAccessKey
    },
    body: JSON.stringify({ intent })
  })

  if (!res.ok) {
    let errorMessage = `Failed to fetch widget data, with status: ${res.status}`

    try {
      const data = await res.json()

      if (data.cause) {
        errorMessage = `Failed to fetch widget data: ${data.cause}`
      } else if (data.message) {
        errorMessage = `Failed to fetch widget data: ${data.message}`
      } else if (data.error) {
        errorMessage = `Failed to fetch widget data: ${data.error}`
      }
    } catch (parseError) {
      console.error('Could not parse error response as JSON:', parseError)
    }

    throw new Error(errorMessage)
  }

  const data = await res.json()

  return data.resp
}

export interface FetchFortePaymentStatusArgs {
  paymentIntentId: string
}

export type FortePaymentStatus = 'Expired' | 'Created' | 'Declined' | 'Approved'

export interface FetchFortePaymentStatusReturn {
  status: FortePaymentStatus
}

export const fetchFortePaymentStatus = async (
  forteApiUrl: string,
  projectAccessKey: string,
  args: FetchFortePaymentStatusArgs
): Promise<FetchFortePaymentStatusReturn> => {
  const { paymentIntentId } = args

  const url = `${forteApiUrl}/rpc/API/FortePayGetPaymentStatuses`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': projectAccessKey
    },
    body: JSON.stringify({
      paymentIntentIds: [paymentIntentId]
    })
  })

  const { statuses } = await res.json()

  return {
    status: (statuses[0]?.status as FortePaymentStatus) || ''
  }
}
