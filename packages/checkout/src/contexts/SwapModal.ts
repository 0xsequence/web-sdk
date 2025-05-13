'use client'

import type { Hex } from 'viem'

import { createGenericContext } from './genericContext.js'

interface Transaction {
  to: Hex
  data?: Hex
  value?: bigint
}

export interface SwapModalSettings {
  chainId: number
  toTokenAddress: string
  toTokenAmount: string
  slippageBps?: number
  title?: string
  description?: string
  disableMainCurrency?: boolean
  postSwapTransactions?: Transaction[]
  blockConfirmations?: number
  customSwapErrorMessage?: string
  onSuccess?: (txHash: string) => void
}

type SwapModalContext = {
  isSwapModalOpen: boolean
  openSwapModal: (settings: SwapModalSettings) => void
  closeSwapModal: () => void
  swapModalSettings?: SwapModalSettings
}

const [useSwapModalContext, SwapModalContextProvider] = createGenericContext<SwapModalContext>()

export { SwapModalContextProvider, useSwapModalContext }
