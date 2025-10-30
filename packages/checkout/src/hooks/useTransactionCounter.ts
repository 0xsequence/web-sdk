import { useState } from 'react'

export const useTransactionCounter = () => {
  const [currentTransactionNumber, setCurrentTransactionNumber] = useState(1)
  const [maxTransactions, setMaxTransactions] = useState(0)

  const initializeTransactionCounter = (maxTransactions: number) => {
    setCurrentTransactionNumber(1)
    setMaxTransactions(maxTransactions)
  }

  const resetTransactionCounter = () => {
    setCurrentTransactionNumber(1)
    setMaxTransactions(0)
  }

  const incrementTransactionCount = () => {
    setCurrentTransactionNumber(currentTransactionNumber + 1)
  }

  const isTransactionCounterInitialized = maxTransactions > 0

  return {
    currentTransactionNumber,
    maxTransactions,
    incrementTransactionCount,
    initializeTransactionCounter,
    resetTransactionCounter,
    isTransactionCounterInitialized
  }
}
