import React from 'react'
import { createGenericContext } from '../utils'

type ConnectModalContext = {
  setOpenConnectModal: React.Dispatch<React.SetStateAction<boolean>>
  openConnectModalState: boolean
}

const [useConnectModalContext, ConnectModalContextProvider] = createGenericContext<ConnectModalContext>()
export { useConnectModalContext, ConnectModalContextProvider }
