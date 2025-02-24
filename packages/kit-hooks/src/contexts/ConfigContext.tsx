'use client'

import { createContext } from 'react'

export interface ReactHooksConfig {
  projectAccessKey: string
  env: {
    indexerGatewayUrl: string
    metadataUrl: string
    indexerUrl: string
    imageProxyUrl: string
  }
}

export const ReactHooksConfigContext = createContext<ReactHooksConfig | null>(null)

export const ReactHooksConfigProvider = ReactHooksConfigContext.Provider
