import React from 'react'
import { CreateConnectorFn } from 'wagmi'

import { LocalStorageKey } from '../constants'

export interface WalletProperties {
  id: string
  logoDark: React.FunctionComponent
  logoLight: React.FunctionComponent
  monochromeLogoDark?: React.FunctionComponent
  monochromeLogoLight?: React.FunctionComponent
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

export type ExtendedConnector = CreateConnectorFn & WalletField

export const getKitConnectWallets = (projectAccessKey: string, wallets: any[], googleClientId?: string): CreateConnectorFn[] => {
  localStorage.setItem(LocalStorageKey.ProjectAccessKey, projectAccessKey)

  localStorage.setItem(LocalStorageKey.GoogleClientID, googleClientId ?? '')

  const connectors: CreateConnectorFn[] = []

  // hide connector if there is an identical injected wallet
  const injectedWallet = wallets.find(connector => connector.id === 'injected')

  const filteredWallets = wallets.filter(wallet => {
    if (!injectedWallet || !injectedWallet.hideConnectorId) {
      return true
    }
    return wallet.id !== injectedWallet.hideConnectorId
  })

  filteredWallets.forEach(wallet => {
    const { createConnector, ...metaProperties } = wallet
    const walletProperties = { ...metaProperties }

    const createConnectorOverride = (config: any) => {
      const connector = createConnector()

      const res = connector(config)
      res._wallet = { ...walletProperties }

      return res
    }

    connectors.push(createConnectorOverride)
  })

  return connectors
}
