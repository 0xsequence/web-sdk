import { createConfig as createWagmiConfig, type CreateConfigParameters, type Config } from 'wagmi'

import { KitConfig, WalletType } from '../types'

import { getDefaultChains } from './defaultChains'
import { DefaultConnectorsProps, getDefaultConnectors } from './defaultConnectors'
import { getDefaultTransports } from './defaultTransports'

type DefaultConfigProps<T extends WalletType> = KitConfig &
  DefaultConnectorsProps<T> & {
    chainIds?: number[]
    wagmiConfig?: Partial<Omit<CreateConfigParameters, 'client'>>
  }

export interface SequenceKitConfig {
  wagmiConfig: Config
  kitConfig: KitConfig
}

export const createConfig = <T extends WalletType>(walletType: T, props: DefaultConfigProps<T>): SequenceKitConfig => {
  const { projectAccessKey, chainIds, wagmiConfig, ...rest } = props

  const chains = wagmiConfig?.chains || getDefaultChains(chainIds)
  const transports = wagmiConfig?.transports || getDefaultTransports(chains)
  const connectors = wagmiConfig?.connectors || getDefaultConnectors(walletType, props)

  return {
    kitConfig: {
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
