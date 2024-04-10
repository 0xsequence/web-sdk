import { injected } from 'wagmi/connectors'

import { MetamaskLogo } from './MetamaskLogo'

export const metamask = () => ({
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
