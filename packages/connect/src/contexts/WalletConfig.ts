'use client'

import { DisplayedAsset } from '../types'

import { createGenericContext } from './genericContext'

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
