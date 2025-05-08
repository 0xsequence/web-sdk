'use client'

import type { Dispatch, SetStateAction } from 'react'

import { createGenericContext } from './genericContext'

type ConnectModalContext = {
  isConnectModalOpen: boolean
  setOpenConnectModal: Dispatch<SetStateAction<boolean>>
  openConnectModalState: boolean
}

const [useConnectModalContext, ConnectModalContextProvider] = createGenericContext<ConnectModalContext>()

export { ConnectModalContextProvider, useConnectModalContext }
