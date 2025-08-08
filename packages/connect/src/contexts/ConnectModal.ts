'use client'

import { createGenericContext } from '@0xsequence/web-sdk-core'
import type { Dispatch, SetStateAction } from 'react'

type ConnectModalContext = {
  isConnectModalOpen: boolean
  setOpenConnectModal: Dispatch<SetStateAction<boolean>>
  openConnectModalState: boolean
}

const [useConnectModalContext, ConnectModalContextProvider] = createGenericContext<ConnectModalContext>()

export { ConnectModalContextProvider, useConnectModalContext }
