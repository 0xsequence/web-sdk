import { createConfig as createWagmiConfig, type Config, type CreateConfigParameters } from 'wagmi'

import type { ConnectConfig } from '../types.js'

import { getDefaultChains } from './defaultChains.js'
import { getDefaultConnectors, type DefaultConnectorOptions } from './defaultConnectors.js'
import { getDefaultTransports } from './defaultTransports.js'

export type CreateConfigOptions = ConnectConfig &
  DefaultConnectorOptions & {
    chainIds?: number[]
    wagmiConfig?: Partial<Omit<CreateConfigParameters, 'client'>>
  }

export interface SequenceConnectConfig {
  wagmiConfig: Config
  connectConfig: ConnectConfig
}

export const createConfig = (options: CreateConfigOptions): SequenceConnectConfig => {
  const { projectAccessKey, chainIds, wagmiConfig, ...rest } = options

  const chains = wagmiConfig?.chains || getDefaultChains(chainIds)
  const transports = wagmiConfig?.transports || getDefaultTransports(chains)
  const connectors = wagmiConfig?.connectors || getDefaultConnectors(options)

  return {
    connectConfig: {
      projectAccessKey,
      ...rest
    },
    wagmiConfig: createWagmiConfig({
      ...wagmiConfig,
      chains,
      transports,
      connectors
    })
  }
}
