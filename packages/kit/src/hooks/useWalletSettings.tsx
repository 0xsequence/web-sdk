import React from 'react'
import { useWalletConfigContext } from '../contexts/WalletSettings'

export const useWalletSettings = () => {
  const { setDisplayedAssets, displayedAssets } = useWalletConfigContext()

  return {
    displayedAssets,
    setDisplayedAssets
  }
}
