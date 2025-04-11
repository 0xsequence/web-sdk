import { TokenBalanceWithPrice } from '../utils'

import { createGenericContext } from './genericContext'

export interface SwapContext {
  fromCoin: TokenBalanceWithPrice | undefined
  toCoin: TokenBalanceWithPrice | undefined
  amount: number
  nonRecentAmount: number
  recentInput: 'from' | 'to'
  isSwapReady: boolean
  isSwapQuotePending: boolean
  hasInsufficientFunds: boolean
  isErrorSwapQuote: boolean
  isTxnPending: boolean
  isErrorTxn: boolean
  setFromCoin: (coin: TokenBalanceWithPrice | undefined) => void
  setToCoin: (coin: TokenBalanceWithPrice | undefined) => void
  setAmount: (amount: number, type: 'from' | 'to') => void
  switchCoinOrder: () => void
  onSubmitSwap: () => void
  resetSwapStates: () => void
}

const [useSwapContext, SwapContextProvider] = createGenericContext<SwapContext>()

export { useSwapContext, SwapContextProvider }
