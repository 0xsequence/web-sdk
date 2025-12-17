import { createContext, useContext } from 'react'

import type { ConnectConfig } from '../types.js'

const ConnectConfigContext = createContext<ConnectConfig | undefined>(undefined)

export const ConnectConfigContextProvider = ConnectConfigContext.Provider

export const useConnectConfigContext = (): ConnectConfig => {
  const ctx = useContext(ConnectConfigContext)
  if (!ctx) {
    throw new Error('useConnectConfigContext must be used within a Provider')
  }
  return ctx
}

export const useOptionalConnectConfigContext = (): ConnectConfig | undefined => {
  return useContext(ConnectConfigContext)
}
