import { SequenceAPIClient } from '@0xsequence/api'
import { TokenMetadata } from '@0xsequence/metadata'
import { ChainId, networks } from '@0xsequence/network'

import { CreditCardCheckout } from '../contexts'

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
