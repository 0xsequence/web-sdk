import React from 'react'
import { Transaction } from '@0xsequence/indexer'
import { createGenericContext } from '../utils/genericContext'

export interface CollectionDetailsParams {
  contractAddress: string
  chainId: number
}

export interface CollectionDetailsNavigation {
  location: 'collection-details'
  params: CollectionDetailsParams
}

export interface CoinDetailsParams {
  contractAddress: string
  chainId: number
}

export interface CoinDetailsNavigation {
  location: 'coin-details'
  params: CoinDetailsParams
}

export interface CollectibleDetailsParams {
  contractAddress: string
  chainId: number
  tokenId: string
}

export interface CollectibleDetailsNavigation {
  location: 'collectible-details'
  params: CollectibleDetailsParams
}

export interface TransactionDetailsParams {
  transaction: Transaction
}

export interface TransactionDetailsNavigation {
  location: 'transaction-details'
  params: TransactionDetailsParams
}

export interface SearchViewAllParams {
  defaultTab: 'coins' | 'collections'
}

export interface SearchViewAllNavigation {
  location: 'search-view-all'
  params: SearchViewAllParams
}

export interface SendCoinParams {
  chainId: number
  contractAddress: string
}

export interface SendCoinNavigation {
  location: 'send-coin'
  params: SendCoinParams
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
    | 'receive'
    | 'history'
    | 'receive'
    | 'settings'
    | 'settings-general'
    | 'settings-currency'
    | 'settings-networks'
    | 'search'
}

export type Navigation =
  | BasicNavigation
  | CoinDetailsNavigation
  | CollectibleDetailsNavigation
  | CollectionDetailsNavigation
  | TransactionDetailsNavigation
  | SearchViewAllNavigation
  | SendCoinNavigation
  | SendCollectibleNavigation

export type History = Navigation[]

type NavigationContext = {
  setHistory: (history: History) => void
  history: History
}

export const [useNavigationContext, NavigationContextProvider] = createGenericContext<NavigationContext>()
