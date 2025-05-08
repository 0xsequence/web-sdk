'use client'

import { createGenericContext } from './genericContext'
import type { Navigation } from './Navigation'

export interface WalletOptions {
  defaultNavigation?: Navigation
}

type WalletModalContext = {
  setOpenWalletModal: (open: boolean, options?: WalletOptions) => void
  openWalletModalState: boolean
}

const [useWalletModalContext, WalletModalContextProvider] = createGenericContext<WalletModalContext>()

export { useWalletModalContext, WalletModalContextProvider }
