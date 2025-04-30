import { TransactionOnRampProvider } from '@0xsequence/marketplace'
import { type SequenceIndexer, type TransactionReceipt } from '@0xsequence/indexer'
import type { Hex } from 'viem'

import type { ForteConfig, TransakConfig } from '../contexts/CheckoutModal.js'

import { createGenericContext } from './genericContext.js'

export type CreditCardProviders = 'sardine' | 'transak' | 'forte'

export interface Collectible {
  tokenId?: string
  quantity: string
  decimals?: number
  price?: string
}

export interface SupplementaryAnalyticsInfo {
  [key: string]: string
}

export interface SardineConfig {
  approvedSpenderAddress?: string
}

export interface ActionButtons {
  label: string
  action: () => void
}

export interface SelectPaymentSettings {
  collectibles: Collectible[]
  chain: number | string
  currencyAddress: string | Hex
  price: string
  targetContractAddress: string | Hex
  txData: Hex
  collectionAddress: string | Hex
  recipientAddress: string | Hex
  approvedSpenderAddress?: string
  transactionConfirmations?: number
  onSuccess?: (txHash?: string) => void
  onError?: (error: Error) => void
  onClose?: () => void
  onRampProvider?: TransactionOnRampProvider
  creditCardProviders?: string[]
  transakConfig?: TransakConfig
  sardineConfig?: SardineConfig
  forteConfig?: ForteConfig
  customProviderCallback?: (onSuccess: (txHash: string) => void, onError: (error: Error) => void, onClose: () => void) => void
  supplementaryAnalyticsInfo?: SupplementaryAnalyticsInfo
  skipNativeBalanceCheck?: boolean
  slippageBps?: number
  nativeTokenAddress?: string
  successActionButtons?: ActionButtons[]
  onSuccessChecker?: (receipt: TransactionReceipt, indexerClient?: SequenceIndexer) => Promise<void>
}

type SelectPaymentModalContext = {
  openSelectPaymentModal: (settings: SelectPaymentSettings) => void
  closeSelectPaymentModal: () => void
  selectPaymentSettings?: SelectPaymentSettings
}

const [useSelectPaymentContext, SelectPaymentContextProvider] = createGenericContext<SelectPaymentModalContext>()

export { SelectPaymentContextProvider, useSelectPaymentContext }
