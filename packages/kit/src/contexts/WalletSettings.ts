'use client'

import React from 'react'

import { DisplayedAsset } from '../types'

import { createGenericContext } from './genericContext'

type WalletConfigContext = {
  setDisplayedAssets: React.Dispatch<React.SetStateAction<DisplayedAsset[]>>
  displayedAssets: DisplayedAsset[]
  readOnlyNetworks?: number[]
}

export const [useWalletConfigContext, WalletConfigContextProvider] = createGenericContext<WalletConfigContext>()
