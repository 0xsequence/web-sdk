import React from 'react'
import { createGenericContext } from '../utils'
import { DisplayedAsset } from '../components/KitProvider'

type WalletConfigContext = {
  setDisplayedAssets: React.Dispatch<React.SetStateAction<DisplayedAsset[]>>
  displayedAssets: DisplayedAsset[]
}

export const [useWalletConfigContext, WalletConfigContextProvider] = createGenericContext<WalletConfigContext>()
