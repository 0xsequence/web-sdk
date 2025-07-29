'use client'

import { createGenericContext } from '@0xsequence/common'
import type { DisplayedAsset } from '../types.js'

type WalletConfigContext = {
  setDisplayedAssets: React.Dispatch<React.SetStateAction<DisplayedAsset[]>>
  displayedAssets: DisplayedAsset[]
  readOnlyNetworks?: number[]
  hideExternalConnectOptions?: boolean
  hideConnectedWallets?: boolean
  hideSocialConnectOptions?: boolean
}

const [useWalletConfigContext, WalletConfigContextProvider] = createGenericContext<WalletConfigContext>()

export { useWalletConfigContext, WalletConfigContextProvider }
