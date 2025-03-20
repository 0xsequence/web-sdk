'use client'

import { createContext } from 'react'

export interface SequenceHooksEnv {
  indexerGatewayUrl: string
  metadataUrl: string
  apiUrl: string
  indexerUrl: string
  imageProxyUrl: string
}

export interface SequenceHooksConfigProviderValue {
  projectAccessKey: string
  env?: Partial<SequenceHooksEnv>
}

export interface SequenceHooksConfig {
  projectAccessKey: string
  env: Required<SequenceHooksEnv>
}

const defaultEnv: Required<SequenceHooksEnv> = {
  indexerGatewayUrl: 'https://indexer.sequence.app',
  metadataUrl: 'https://metadata.sequence.app',
  apiUrl: 'https://api.sequence.app',
  indexerUrl: 'https://indexer.sequence.app',
  imageProxyUrl: 'https://imgproxy.sequence.xyz/'
}

export const SequenceHooksContext = createContext<SequenceHooksConfig | null>(null)

interface SequenceHooksProviderProps {
  children: React.ReactNode
  config: SequenceHooksConfigProviderValue
}

export const SequenceHooksProvider = (props: SequenceHooksProviderProps) => {
  const config = {
    ...props.config,
    env: {
      ...defaultEnv,
      ...props.config.env
    }
  }

  return <SequenceHooksContext.Provider value={config}>{props.children}</SequenceHooksContext.Provider>
}
