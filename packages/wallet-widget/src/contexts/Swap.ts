import type { TokenBalanceWithDetails } from '../utils/index.js'

import { createGenericContext } from './genericContext.js'

export interface SwapContext {
  fromCoin: TokenBalanceWithDetails | undefined
  toCoin: TokenBalanceWithDetails | undefined
  amount: number
  nonRecentAmount: number
  recentInput: 'from' | 'to'
  isSwapReady: boolean
  isSwapQuotePending: boolean
  hasInsufficientFunds: boolean
  isErrorSwapQuote: boolean
  isTxnPending: boolean
  isErrorTxn: boolean
  setFromCoin: (coin: TokenBalanceWithDetails | undefined) => void
  setToCoin: (coin: TokenBalanceWithDetails | undefined) => void
  setAmount: (amount: number, type: 'from' | 'to') => void
  switchCoinOrder: () => void
  onSubmitSwap: () => void
  resetSwapStates: () => void
}

const [useSwapContext, SwapContextProvider] = createGenericContext<SwapContext>()

export { SwapContextProvider, useSwapContext }
