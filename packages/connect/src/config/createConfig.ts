import { createConfig as createWagmiConfig, type Config, type CreateConfigParameters } from 'wagmi'

import type { ConnectConfig, WalletType } from '../types.js'

import { getDefaultChains } from './defaultChains.js'
import { getDefaultConnectors, type DefaultConnectorOptions } from './defaultConnectors.js'
import { getDefaultTransports } from './defaultTransports.js'

export type CreateConfigOptions<T extends WalletType> = ConnectConfig &
  DefaultConnectorOptions<T> & {
    chainIds?: number[]
    wagmiConfig?: Partial<Omit<CreateConfigParameters, 'client'>>
  }

export interface SequenceConnectConfig {
  wagmiConfig: Config
  connectConfig: ConnectConfig
}

export const createConfig = <T extends WalletType>(walletType: T, options: CreateConfigOptions<T>): SequenceConnectConfig => {
  const { projectAccessKey, chainIds, wagmiConfig, ...rest } = options

  const chains = wagmiConfig?.chains || getDefaultChains(chainIds)
  const transports = wagmiConfig?.transports || getDefaultTransports(chains)
  const connectors = wagmiConfig?.connectors || getDefaultConnectors(walletType, options)

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
