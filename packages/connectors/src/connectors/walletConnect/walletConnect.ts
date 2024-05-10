import { Wallet } from '@0xsequence/kit'
import { walletConnect as walletConnectbase, WalletConnectParameters } from 'wagmi/connectors'

import { WalletConnectLogo } from './WalletConnectLogo'

export const walletConnect = (options: WalletConnectParameters): Wallet => ({
  id: 'wallet-connect',
  logoDark: WalletConnectLogo,
  logoLight: WalletConnectLogo,
  // iconBackground: '#fff',
  name: 'Walletconnect',
  createConnector: () => {
    const connector = walletConnectbase({
      ...options
    })
    return connector
  }
})
