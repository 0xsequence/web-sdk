import { CheckoutSettings } from '@0xsequence/kit-checkout'
import { Hex, encodeFunctionData } from 'viem'

import { orderbookAbi } from '../constants/orderbook-abi'

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

export interface GetCheckoutSettings {
  chainId: number
  contractAddress: string
  recipientAddress: string
  currencyQuantity: string
  currencySymbol: string
  currencyAddress: string
  currencyDecimals: string
  nftId: string
  nftAddress: string
  nftQuantity: string
  calldata: string
  approvedSpenderAddress?: string
  nftDecimals?: string
}

export const getCheckoutSettings = (args: GetCheckoutSettings) => {
  const checkoutSettings: CheckoutSettings = {
    creditCardCheckout: {
      defaultPaymentMethodType: 'us_debit',
      onSuccess: hash => {
        console.log('credit card checkout success', hash)
      },
      onError: e => {
        console.log('credit card checkout error', e)
      },
      ...args
    }
    // orderSummaryItems: [
    //   {
    //     chainId: args.chainId,
    //     contractAddress: args.nftAddress,
    //     tokenId: args.nftId,
    //     quantityRaw: String(args.nftQuantity)
    //   }
    // ]
  }

  return checkoutSettings
}

export interface GetOrderbookCalldata {
  orderId: string
  quantity: string
  recipient: string
}

export const getOrderbookCalldata = ({ orderId, quantity, recipient }: GetOrderbookCalldata) => {
  const calldata = encodeFunctionData({
    abi: orderbookAbi,
    functionName: 'acceptRequest',
    args: [BigInt(orderId), BigInt(quantity), recipient as Hex, [], []]
  })

  return calldata
}
