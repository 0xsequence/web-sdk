import React from 'react'

import { createGenericContext } from './genericContext'

type WalletModalContext = {
  setOpenWalletModal: React.Dispatch<React.SetStateAction<boolean>>
  openWalletModalState: boolean
}

export const [useWalletModalContext, WalletModalContextProvider] = createGenericContext<WalletModalContext>()
