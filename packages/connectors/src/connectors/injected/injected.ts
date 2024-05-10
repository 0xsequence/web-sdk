import { Wallet } from '@0xsequence/kit'
import { ethers } from 'ethers'
import React from 'react'
import { injected as injectedBase } from 'wagmi/connectors'

import { InjectedLogo } from './InjectedLogo'


declare global {
  interface Window {
    /* @ts-ignore-next-line */
    ethereum?: ethers.providers.ExternalProvider
  }
}

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
