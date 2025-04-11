import { useSwapContext } from '../contexts/Swap'

export const useSwap = () => {
  const {
    fromCoin,
    toCoin,
    amount,
    nonRecentAmount,
    recentInput,
    isSwapReady,
    isSwapQuotePending,
    hasInsufficientFunds,
    isErrorSwapQuote,
    isTxnPending,
    isErrorTxn,
    setFromCoin,
    setToCoin,
    setAmount,
    switchCoinOrder,
    onSubmitSwap,
    resetSwapStates
  } = useSwapContext()

  return {
    fromCoin,
    toCoin,
    amount,
    nonRecentAmount,
    recentInput,
    isSwapReady,
    isSwapQuotePending,
    hasInsufficientFunds,
    isErrorSwapQuote,
    isTxnPending,
    isErrorTxn,
    setFromCoin,
    setToCoin,
    setAmount,
    switchCoinOrder,
    onSubmitSwap,
    resetSwapStates
  }
}
