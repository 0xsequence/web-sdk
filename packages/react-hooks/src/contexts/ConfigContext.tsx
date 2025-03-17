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

const defaultEnv: Required<SequenceHooksConfig['env']> = {
  indexerGatewayUrl: 'https://indexer.sequence.app',
  metadataUrl: 'https://metadata.sequence.app',
  apiUrl: 'https://api.sequence.app',
  indexerUrl: 'https://indexer.sequence.app',
  imageProxyUrl: 'https://imgproxy.sequence.xyz/'
}

export const SequenceHooksContext = createContext<SequenceHooksConfig | null>(null)

export const SequenceHooksProvider = ({
  children,
  value
}: {
  children: React.ReactNode
  value: SequenceHooksConfigProviderValue
}) => {
  const env = { ...defaultEnv, ...value.env }

  return <SequenceHooksContext.Provider value={{ ...value, env }}>{children}</SequenceHooksContext.Provider>
}
