import { createConfig, http, type CreateConfigParameters, type Config } from 'wagmi'

import { WalletType } from '../types'

import { getDefaultChains } from './defaultChains'
import { DefaultConnectorsProps, getDefaultConnectors } from './defaultConnectors'

type DefaultConfigProps<T extends WalletType> = DefaultConnectorsProps<T> & {
  chainIds?: number[]
  wagmiConfig?: Partial<Omit<CreateConfigParameters, 'client'>>
}

export const getDefaultConfig = <T extends WalletType>(walletType: T, props: DefaultConfigProps<T>): Config => {
  const { wagmiConfig } = props

  const chains = wagmiConfig?.chains || getDefaultChains(props.chainIds)
  const transports = wagmiConfig?.transports || Object.fromEntries(chains.map(chain => [chain.id, http()]))
  const connectors = wagmiConfig?.connectors || getDefaultConnectors(walletType, props)

  const config = createConfig({
    ...wagmiConfig,
    chains,
    transports,
    connectors
  })

  return config
}
