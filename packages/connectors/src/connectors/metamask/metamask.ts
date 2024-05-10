import { Wallet } from '@0xsequence/kit'
import { injected } from 'wagmi/connectors'

import { MetamaskLogo } from './MetamaskLogo'

export const metamask = (): Wallet => ({
  id: 'metamask',
  logoDark: MetamaskLogo,
  logoLight: MetamaskLogo,
  // iconBackground: '#fff',
  name: 'Metamask',
  createConnector: () => {
    const connector = injected({ target: 'metaMask' })
    return connector
  }
})
