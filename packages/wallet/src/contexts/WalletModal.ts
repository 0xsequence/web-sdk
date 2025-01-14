'use client'

import React from 'react'

import { createGenericContext } from './genericContext'
import { Navigation } from './Navigation'

export interface WalletOptions {
  defaultNavigation?: Navigation
}

type WalletModalContext = {
  setOpenWalletModal: (open: boolean, options?: WalletOptions) => void
  openWalletModalState: boolean
}

export const [useWalletModalContext, WalletModalContextProvider] = createGenericContext<WalletModalContext>()
