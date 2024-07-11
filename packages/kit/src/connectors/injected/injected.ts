import React from 'react'
import { injected as injectedBase } from 'wagmi/connectors'

import { Wallet } from '../../types'

import { InjectedLogo } from './InjectedLogo'

export interface MoreExternalProviders {
  isSequence?: boolean
}

export interface InjectedWalletInformation {
  name: string
  logoDark: React.FunctionComponent
  logoLight: React.FunctionComponent
}

const getInjectedWalletInformation = (): InjectedWalletInformation => {
  return {
    name: 'Injected Wallet',
    logoDark: InjectedLogo,
    logoLight: InjectedLogo
  }
}

export const injected = (): Wallet => {
  const { name, logoDark, logoLight } = getInjectedWalletInformation()

  return {
    id: 'injected',
    logoDark,
    logoLight,
    // iconBackground: '#fff',
    name,
    createConnector: () => {
      const connector = injectedBase()
      return connector
    }
  }
}
