import React from 'react'
import { ethers } from 'ethers'
import { injected as injectedBase } from 'wagmi/connectors'

import { InjectedLogo } from './InjectedLogo'
import { MetamaskLogo } from '../metamask/MetamaskLogo'
import { SequenceLogo } from '../sequence/SequenceLogo'

declare global {
  interface Window {
    /* @ts-ignore-next-line */
    ethereum?: ethers.providers.ExternalProvider;
  }
}

export interface MoreExternalProviders {
  isSequence?: boolean
}

export interface InjectedWalletInformation {
  hideConnectorId: string | null;
  name: string;
  logoDark: React.FunctionComponent;
  logoLight: React.FunctionComponent
}

const getInjectedWalletInformation = (): InjectedWalletInformation => {
  if (window?.ethereum?.isMetaMask) {
    return {
      name: 'Metamask',
      logoDark: MetamaskLogo,
      logoLight: MetamaskLogo,
      hideConnectorId: 'metamask'
    }
  /* @ts-ignore-next-line */
  } else if (window?.ethereum?.isSequence) {
    return {
      name: 'Sequence',
      logoDark: SequenceLogo,
      logoLight: SequenceLogo,
      hideConnectorId: null
    }
  } else {
    return {
      name: 'Injected Wallet',
      logoDark: InjectedLogo,
      logoLight: InjectedLogo,
      hideConnectorId: null
    }
  }
}

export const injected = () => {
  const { name, hideConnectorId, logoDark, logoLight } = getInjectedWalletInformation()

  return ({
    id: 'injected',
    hideConnectorId,
    logoDark,
    logoLight,
    // iconBackground: '#fff',
    name,
    createConnector: () => {
      const connector = injectedBase();
      return connector
    }
  })
}