import { useSwapContext } from '../contexts/Swap'

export const useSwap = () => {
  const {
    fromCoin,
    toCoin,
    fromAmount,
    toAmount,
    recentInput,
    isSwapReady,
    isSwapQuotePending,
    hasInsufficientFunds,
    isErrorSwapQuote,
    isTxnPending,
    isErrorTxn,
    setFromCoin,
    setToCoin,
    setFromAmount,
    setToAmount,
    setRecentInput,
    setNonRecentAmount,
    switchCoinOrder,
    onSubmitSwap
  } = useSwapContext()

  return {
    fromCoin,
    toCoin,
    fromAmount,
    toAmount,
    recentInput,
    isSwapReady,
    isSwapQuotePending,
    hasInsufficientFunds,
    isErrorSwapQuote,
    isTxnPending,
    isErrorTxn,
    setFromCoin,
    setToCoin,
    setFromAmount,
    setToAmount,
    setRecentInput,
    setNonRecentAmount,
    switchCoinOrder,
    onSubmitSwap
  }
}
