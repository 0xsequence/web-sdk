'use client'

import { createContext } from 'react'

export interface SequenceHooksConfig {
  projectAccessKey: string
  env: {
    indexerGatewayUrl: string
    metadataUrl: string
    apiUrl: string
    indexerUrl: string
    imageProxyUrl: string
  }
}

export const SequenceHooksContext = createContext<SequenceHooksConfig | null>(null)

export const SequenceHooksProvider = SequenceHooksContext.Provider
