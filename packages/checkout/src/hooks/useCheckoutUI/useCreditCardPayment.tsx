import React from 'react'
import { Hex } from 'viem'

import { Collectible } from '../../contexts/SelectPaymentModal'
import { TransakConfig } from '../../contexts/CheckoutModal'
import { TRANSAK_PROXY_ADDRESS } from '../../utils/transak'

const POLLING_TIME = 10 * 1000
const SEQUENCE_IFRAME_ID = 'credit-card-payment-iframe'

export interface UseCreditCardPaymentArgs {
  chain: string | number
  currencyAddress: string
  totalPriceRaw: string
  collectibles: Collectible
  collectionAddress: string
  recipientAddress: string
  targetContractAddress: string
  txData: Hex
  transactionConfirmations?: number
  creditCardProvider?: 'sardine' | 'transak'
  transakConfig?: TransakConfig
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
}

export interface UseCreditCardPaymentReturn {
  iframeId: string
  paymentUrl?: string
  CreditCardIframe?: HTMLIFrameElement
  EventListener?: React.ReactNode
}

export const useCreditCardPayment =
  ({
    chain,
    currencyAddress,
    totalPriceRaw,
    collectibles,
    collectionAddress,
    recipientAddress,
    targetContractAddress,
    txData,
    transactionConfirmations,
    creditCardProvider,
    transakConfig,
    onSuccess,
    onError
  }: UseCreditCardPaymentArgs) =>
  () => {
    const missingCreditCardProvider = !creditCardProvider
    const missingTransakConfig = !transakConfig && creditCardProvider === 'transak'

    if (missingCreditCardProvider || missingTransakConfig) {
      return {
        iframeId: SEQUENCE_IFRAME_ID,
        paymentUrl: undefined,
        CreditCardIframe: undefined,
        EventListener: undefined
      }
    }

    return {
      iframeId: 'credit-card-payment-iframe',
      paymentUrl: 'https://checkout.transak.com/checkout.html',
      CreditCardIframe: <iframe />,
      EventListener: <div />
    }
  }
