'use client'

import type { Transaction } from '@0xsequence/indexer'

import { createGenericContext } from './genericContext.js'

export interface CoinDetailsParams {
  contractAddress: string
  chainId: number
  accountAddress: string
}

export interface CoinDetailsNavigation {
  location: 'coin-details'
  params: CoinDetailsParams
}

export interface CollectibleDetailsParams {
  contractAddress: string
  chainId: number
  tokenId: string
  accountAddress: string
}

export interface CollectibleDetailsNavigation {
  location: 'collectible-details'
  params: CollectibleDetailsParams
}

export interface CollectionDetailsParams {
  contractAddress: string
  chainId: number
}

export interface CollectionDetailsNavigation {
  location: 'collection-details'
  params: CollectionDetailsParams
}

export interface TransactionDetailsParams {
  transaction: Transaction
}

export interface TransactionDetailsNavigation {
  location: 'transaction-details'
  params: TransactionDetailsParams
}

export interface SendCoinParams {
  chainId: number
  contractAddress: string
}

export interface SwapCoinParams {
  chainId: number
  contractAddress: string
}

export interface SwapCoinListParams {
  chainId: number
  contractAddress: string
  amount: string
}

export interface SendCoinNavigation {
  location: 'send-coin'
  params: SendCoinParams
}

export interface SwapCoinNavigation {
  location: 'swap-coin'
  params: SwapCoinParams
}

export interface SwapCoinListNavigation {
  location: 'swap-coin-list'
  params: SwapCoinListParams
}

export interface SendCollectibleParams {
  chainId: number
  contractAddress: string
  tokenId: string
}

export interface SendCollectibleNavigation {
  location: 'send-collectible'
  params: SendCollectibleParams
}

export interface BasicNavigation {
  location:
    | 'home'
    | 'send-general'
    | 'swap'
    | 'receive'
    | 'buy'
    | 'history'
    | 'settings'
    | 'settings-wallets'
    | 'settings-currency'
    | 'settings-profiles'
    | 'settings-apps'
    | 'settings-preferences'
    | 'connect-dapp'
    | 'search'
}

export type Navigation =
  | BasicNavigation
  | CoinDetailsNavigation
  | CollectibleDetailsNavigation
  | CollectionDetailsNavigation
  | TransactionDetailsNavigation
  | SendCoinNavigation
  | SendCollectibleNavigation
  | SwapCoinNavigation
  | SwapCoinListNavigation

export type History = Navigation[]

type NavigationContext = {
  setHistory: (history: History) => void
  history: History
  isBackButtonEnabled: boolean
  setIsBackButtonEnabled: (enabled: boolean) => void
}

const [useNavigationContext, NavigationContextProvider] = createGenericContext<NavigationContext>()

export { NavigationContextProvider, useNavigationContext }
