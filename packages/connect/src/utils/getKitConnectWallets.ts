import { CreateConnectorFn } from 'wagmi'

import { ExtendedConnector, Wallet } from '../types'

export const getKitConnectWallets = (projectAccessKey: string, wallets: Wallet[]): CreateConnectorFn[] => {
  const connectors: CreateConnectorFn[] = []

  wallets.forEach(wallet => {
    const { createConnector, ...metaProperties } = wallet
    const walletProperties = { ...metaProperties }

    const createConnectorOverride = (config: any) => {
      const connector = createConnector(projectAccessKey)

      const res = connector(config) as ExtendedConnector
      res._wallet = { ...walletProperties }

      return res
    }

    connectors.push(createConnectorOverride)
  })

  return connectors
}
