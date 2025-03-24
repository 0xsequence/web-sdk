'use client'

import { Hex } from 'viem'

import { createGenericContext } from './genericContext'

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

export { useSwapModalContext, SwapModalContextProvider }
