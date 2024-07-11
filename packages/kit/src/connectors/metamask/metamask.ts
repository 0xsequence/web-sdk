import { injected } from 'wagmi/connectors'

import { Wallet } from '../../types'

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
