import { walletConnect as walletConnectbase, WalletConnectParameters } from 'wagmi/connectors'

import { Wallet } from '../../types'

import { WalletConnectLogo } from './WalletConnectLogo'

export const walletConnect = (options: WalletConnectParameters): Wallet => ({
  id: 'wallet-connect',
  logoDark: WalletConnectLogo,
  logoLight: WalletConnectLogo,
  // iconBackground: '#fff',
  name: 'Walletconnect',
  type: 'wallet',
  createConnector: () => {
    const connector = walletConnectbase({
      ...options
    })
    return connector
  }
})
