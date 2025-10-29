import { useState } from 'react'

export const useTransactionCounter = () => {
  const [transactionCount, setTransactionCount] = useState(1)
  const [maxTransactions, setMaxTransactions] = useState(0)

  const initializeTransactionCounter = (maxTransactions: number) => {
    setTransactionCount(1)
    setMaxTransactions(maxTransactions)
  }

  const resetTransactionCounter = () => {
    setTransactionCount(1)
    setMaxTransactions(0)
  }

  const incrementTransactionCount = () => {
    setTransactionCount(transactionCount + 1)
  }

  const isTransactionCounterInitialized = maxTransactions > 0

  return {
    transactionCount,
    maxTransactions,
    incrementTransactionCount,
    initializeTransactionCounter,
    resetTransactionCounter,
    isTransactionCounterInitialized
  }
}
