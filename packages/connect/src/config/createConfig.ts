import { createConfig as createWagmiConfig, type CreateConfigParameters, type Config } from 'wagmi'

import { ConnectConfig, WalletType } from '../types'

import { getDefaultChains } from './defaultChains'
import { DefaultConnectorOptions, getDefaultConnectors } from './defaultConnectors'
import { getDefaultTransports } from './defaultTransports'

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
