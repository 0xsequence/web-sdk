'use client'

import { createContext } from 'react'

export interface KitHooksConfig {
  projectAccessKey: string
  env: {
    indexerGatewayUrl: string
    metadataUrl: string
    apiUrl: string
    indexerUrl: string
    imageProxyUrl: string
  }
}

export const KitHooksConfigContext = createContext<KitHooksConfig | null>(null)

export const KitHooksProvider = KitHooksConfigContext.Provider
