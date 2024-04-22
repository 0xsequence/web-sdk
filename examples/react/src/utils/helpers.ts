import { CheckoutSettings } from '@0xsequence/kit-checkout'

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
  recipientAddress: string,
  tokenContractAddress: string,
  tokenId: string,
  chainId: number,
  quantity: number,
) => {
  const checkoutSettings: CheckoutSettings = {
    sardineCheckout: {
      authToken: '', // TODO: remove, use token from api
      chainId,
      defaultPaymentMethodType: 'us_debit',
      platform: 'horizon',
      contractAddress: '0xB537a160472183f2150d42EB1c3DD6684A55f74c',
      blockchainNftId: blockchainNftId,
      recipientAddress: recipientAddress,
      quantity
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
