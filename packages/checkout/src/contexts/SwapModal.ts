'use client'

import { createGenericContext } from './genericContext'

import { Hex } from 'viem'

interface Transaction {
  to: Hex
  data?: Hex
  value?: bigint
}

export interface SwapModalSettings {
  chainId: number
  currencyAddress: string
  currencyAmount: string
  title?: string
  description?: string
  disableMainCurrency?: boolean
  postSwapTransactions?: Transaction[]
  blockConfirmations?: number
  onSuccess?: (txHash: string) => void
}

type SwapModalContext = {
  openSwapModal: (settings: SwapModalSettings) => void
  closeSwapModal: () => void
  swapModalSettings?: SwapModalSettings
}

export const [useSwapModalContext, SwapModalContextProvider] = createGenericContext<SwapModalContext>()
