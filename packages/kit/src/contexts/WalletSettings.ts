'use client'

import { createGenericContext } from './genericContext'

type WalletConfigContext = {
  displayedChainIds: number[]
  displayedContracts: string[]
  readOnlyNetworks?: number[]
}

export const [useWalletConfigContext, WalletConfigContextProvider] = createGenericContext<WalletConfigContext>()
