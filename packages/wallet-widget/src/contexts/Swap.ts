import { TokenBalanceWithPrice } from '../utils'

import { createGenericContext } from './genericContext'

export interface SwapContext {
  fromCoin: TokenBalanceWithPrice | undefined
  toCoin: TokenBalanceWithPrice | undefined
  fromAmount: number
  toAmount: number
  recentInput: 'from' | 'to'
  isSwapReady: boolean
  isSwapQuotePending: boolean
  hasInsufficientFunds: boolean
  isErrorSwapQuote: boolean
  isTxnPending: boolean
  isErrorTxn: boolean
  setFromCoin: (coin: TokenBalanceWithPrice | undefined) => void
  setToCoin: (coin: TokenBalanceWithPrice | undefined) => void
  setFromAmount: (amount: number) => void
  setToAmount: (amount: number) => void
  setRecentInput: (input: 'from' | 'to') => void
  setNonRecentAmount: (amount: number) => void
  switchCoinOrder: () => void
  onSubmitSwap: () => void
}

const [useSwapContext, SwapContextProvider] = createGenericContext<SwapContext>()

export { useSwapContext, SwapContextProvider }
