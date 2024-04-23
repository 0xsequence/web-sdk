import React from 'react'
import { Connector, CreateConnectorFn } from 'wagmi'

import { LocalStorageKey } from '../constants'
import { LogoProps } from '@0xsequence/kit-connectors'

export interface WalletProperties {
  id: string
  logoDark: React.FunctionComponent<LogoProps>
  logoLight: React.FunctionComponent<LogoProps>
  monochromeLogoDark?: React.FunctionComponent<LogoProps>
  monochromeLogoLight?: React.FunctionComponent<LogoProps>
  name: string
  iconBackground?: string
  hideConnectorId?: string | null
  isSequenceBased?: boolean
}

export type Wallet = WalletProperties & {
  createConnector: () => CreateConnectorFn
}

export interface WalletField {
  _wallet: WalletProperties
}

export type ExtendedConnector = Connector & WalletField

export const getKitConnectWallets = (projectAccessKey: string, wallets: Wallet[]): CreateConnectorFn[] => {
  localStorage.setItem(LocalStorageKey.ProjectAccessKey, projectAccessKey)

  const connectors: CreateConnectorFn[] = []

  wallets.forEach(wallet => {
    const { createConnector, ...metaProperties } = wallet
    const walletProperties = { ...metaProperties }

    const createConnectorOverride = (config: any) => {
      const connector = createConnector()

      const res = connector(config) as ExtendedConnector
      res._wallet = { ...walletProperties }

      return res
    }

    connectors.push(createConnectorOverride)
  })

  return connectors
}
