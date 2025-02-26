'use client'

import { Navigation } from './Navigation'
import { createGenericContext } from './genericContext'

export interface WalletOptions {
  defaultNavigation?: Navigation
}

type WalletModalContext = {
  setOpenWalletModal: (open: boolean, options?: WalletOptions) => void
  openWalletModalState: boolean
}

export const [useWalletModalContext, WalletModalContextProvider] = createGenericContext<WalletModalContext>()
