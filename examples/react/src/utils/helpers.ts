import { CheckoutSettings } from '@0xsequence/kit-checkout'
import { Address } from 'viem'

export const truncateAtMiddle = (text: string, truncateAt: number) => {
  let finalText = text

  if (text.length >= truncateAt) {
    finalText = text.slice(0, truncateAt / 2) + '...' + text.slice(text.length - truncateAt / 2, text.length)
  }

  return finalText
}

export const formatAddress = (text: string) => {
  return `0x${truncateAtMiddle(text?.substring(2) || '', 8)}`
}

export const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const getCheckoutSettings = (
  blockchainNftId: string,
  recipientAddress: string | Address,
  tokenContractAddress: string,
  tokenId: string,
  chainId: number,
  quantity: number,
  isDev?: boolean
) => {
  const checkoutSettings: CheckoutSettings = {
    sardineCheckout: {
      chainId,
      defaultPaymentMethodType: 'us_debit',
      platform: 'horizon',
      contractAddress: '0xB537a160472183f2150d42EB1c3DD6684A55f74c',
      blockchainNftId: blockchainNftId,
      recipientAddress: recipientAddress,
      quantity,
      isDev
    },
    orderSummaryItems: [
      {
        chainId,
        contractAddress: tokenContractAddress,
        tokenId,
        quantityRaw: String(quantity)
      }
    ]
  }

  return checkoutSettings
}
