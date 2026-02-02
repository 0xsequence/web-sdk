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

export function createConfig<T extends WalletType>(walletType: T, options: CreateConfigOptions<T>): SequenceConnectConfig
export function createConfig(options: CreateConfigOptions<'v3'>): SequenceConnectConfig
export function createConfig<T extends WalletType>(
  walletTypeOrOptions: T | CreateConfigOptions<T> | CreateConfigOptions<'v3'>,
  maybeOptions?: CreateConfigOptions<T>
): SequenceConnectConfig {
  const walletType = (typeof walletTypeOrOptions === 'string' ? walletTypeOrOptions : 'v3') as WalletType
  const options = (typeof walletTypeOrOptions === 'string' ? maybeOptions : walletTypeOrOptions) as CreateConfigOptions<T>

  if (!options) {
    throw new Error('createConfig options are required')
  }

  const { projectAccessKey, chainIds, wagmiConfig, ...rest } = options

  const chains = wagmiConfig?.chains || getDefaultChains(chainIds)
  const nodesUrl = 'nodesUrl' in options ? options.nodesUrl : undefined
  const transports = wagmiConfig?.transports || getDefaultTransports(chains, projectAccessKey, nodesUrl)
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
