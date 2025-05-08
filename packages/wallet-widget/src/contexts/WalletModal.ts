'use client'

import { createGenericContext } from './genericContext.js'
import type { Navigation } from './Navigation.js'

export interface WalletOptions {
  defaultNavigation?: Navigation
}

type WalletModalContext = {
  setOpenWalletModal: (open: boolean, options?: WalletOptions) => void
  openWalletModalState: boolean
}

const [useWalletModalContext, WalletModalContextProvider] = createGenericContext<WalletModalContext>()

export { useWalletModalContext, WalletModalContextProvider }
