import React from 'react'
import { MethodArguments } from '../api'
import { createGenericContext, Theme } from '@0xsequence/kit'

interface CoinQuantity {
  contractAddress: string
  amountRequiredRaw: string
}

interface OrderSummaryItem {
  contractAddress: string
  quantityRaw: string
  tokenId: string
}

export interface CheckoutSettings {
  creditCardCheckout?: {
    chainId: number
    abi: string
    methodName: string
    contractAddress: string
    recipientAddress: string
    receiptTitle: string
    methodArguments: MethodArguments
    currency: string
    currencyAmount: string
    collectionContractAddress?: string
    email?: string
    onSuccess?: (transactionHash: string) => void
    onError?: (error: Error) => void
  }
  cryptoCheckout?: {
    chainId: number
    triggerTransaction: () => void
    coinQuantity: CoinQuantity
  }
  orderSummaryItems: OrderSummaryItem[]
}

type CheckoutModalContext = {
  triggerCheckout: (settings: CheckoutSettings) => void
  closeCheckout: () => void
  settings?: CheckoutSettings
  theme: Theme
}

export const [useCheckoutModalContext, CheckoutModalContextProvider] = createGenericContext<CheckoutModalContext>()
