'use client'

import { type SequenceIndexer, type TransactionReceipt } from '@0xsequence/indexer'

import { createGenericContext } from './genericContext.js'

export interface SupplementaryAnalyticsInfo {
  [key: string]: string
}

export interface ActionButtons {
  label: string
  action: () => void
}

export interface TransakConfig {
  callDataOverride?: string
}

export type ForteProtocolType = 'seaport' | 'mint' | 'custom_evm_call'

export interface StructuredCalldata {
  functionName: string
  arguments: any[]
}

export interface ForteMintConfig {
  protocol: 'mint'
  calldata: string | StructuredCalldata
  sellerAddress: string
}

export interface ForteCustomEvmCallConfig {
  protocol: 'custom_evm_call'
  calldata: string | StructuredCalldata
  sellerAddress: string
}

export interface ForteEventsCallbacks {
  onFortePaymentsBuyNftSuccess?: (e: Event) => void
  onFortePaymentsBuyNftMintSuccess?: (e: Event) => void
  onFortePaymentsWidgetClosed?: (e: Event) => void
}

export type ForteConfig = (ForteMintConfig | ForteCustomEvmCallConfig) & ForteEventsCallbacks

export interface CreditCardCheckoutSettings {
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
  nftDecimals?: string
  calldata: string
  provider?: 'transak' | 'forte' | string
  transakConfig?: TransakConfig
  forteConfig?: ForteConfig
  onSuccess?: (transactionHash?: string, settings?: CreditCardCheckoutSettings) => void
  onError?: (error: Error, settings: CreditCardCheckoutSettings) => void
  onClose?: () => void
  approvedSpenderAddress?: string
  supplementaryAnalyticsInfo?: SupplementaryAnalyticsInfo
  successActionButtons?: ActionButtons[]
  onSuccessChecker?: (receipt: TransactionReceipt, indexerClient?: SequenceIndexer) => Promise<void>
}

type CreditCardCheckoutContext = {
  initiateCreditCardCheckout: (settings: CreditCardCheckoutSettings) => void
  closeCreditCardCheckout: () => void
  settings?: CreditCardCheckoutSettings
}

const [useCreditCardCheckoutModalContext, CreditCardCheckoutModalContextProvider] =
  createGenericContext<CreditCardCheckoutContext>()

export { CreditCardCheckoutModalContextProvider, useCreditCardCheckoutModalContext }
