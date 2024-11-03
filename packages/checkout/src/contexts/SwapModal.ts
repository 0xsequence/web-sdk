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
  postSwapTransactions?: Transaction[]
  blockConfirmations?: number
}

type SwapModalContext = {
  openSwapModal: (settings: SwapModalSettings) => void
  closeSwapModal: () => void
  swapModalSettings?: SwapModalSettings
}

export const [useSwapModalContext, SwapModalContextProvider] = createGenericContext<SwapModalContext>()
