import { ChainId as Chains, findSupportedNetwork } from '@0xsequence/network'
import { zeroAddress } from 'viem'

import { type ForteConfig, type StructuredCalldata } from '../contexts/index.js'

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
      id: recipientAddress.toLowerCase(),
      wallet: {
        address: recipientAddress.toLowerCase(),
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
          address: protocolConfig.sellerAddress.toLowerCase(),
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

export interface TransakNFTData {
  imageURL: string
  nftName: string
  collectionAddress: string
  tokenIDs: string[]
  prices: number[]
  quantity: number
  nftType: string
}

export interface TransakWidgetUrlArgs {
  isNFT?: boolean
  calldata?: string
  targetContractAddress?: string
  cryptoCurrencyCode?: string
  estimatedGasLimit?: number
  nftData?: TransakNFTData[]
  walletAddress: string
  disableWalletAddressForm?: boolean
  partnerOrderId?: string
  network?: string
  referrerDomain: string
  fiatAmount?: string
  fiatCurrency?: string
  defaultFiatAmount?: string
  defaultCryptoCurrency?: string
  cryptoCurrencyList?: string
  networks?: string
}

export const getTransakWidgetUrl = async (
  sequenceApiUrl: string,
  projectAccessKey: string,
  args: TransakWidgetUrlArgs
): Promise<{ url: string }> => {
  const queryUrl = `${sequenceApiUrl}/rpc/API/TransakGetWidgetURL`

  const res = await fetch(queryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': projectAccessKey
    },
    body: JSON.stringify({
      params: {
        ...args
      }
    })
  })

  if (!res.ok) {
    throw new Error(`Transak API error: ${res.status} ${res.statusText}`)
  }

  const { url } = await res.json()

  return {
    url
  }
}
