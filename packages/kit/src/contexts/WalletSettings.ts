import React from 'react'

import { DisplayedAsset } from '../components/KitProvider'
import { createGenericContext } from '../utils'

type WalletConfigContext = {
  setDisplayedAssets: React.Dispatch<React.SetStateAction<DisplayedAsset[]>>
  displayedAssets: DisplayedAsset[]
}

export const [useWalletConfigContext, WalletConfigContextProvider] = createGenericContext<WalletConfigContext>()
