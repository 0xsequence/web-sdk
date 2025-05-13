import type { CreateConnectorFn } from 'wagmi'
import { metaMask as metaMaskConnector, type MetaMaskParameters } from 'wagmi/connectors'

import type { Wallet } from '../../types.js'

import { MetaMaskLogo } from './MetaMaskLogo.js'

export const metaMask = (params: MetaMaskParameters): Wallet => ({
  id: 'metamask-wallet',
  logoDark: MetaMaskLogo,
  logoLight: MetaMaskLogo,
  name: 'MetaMask',
  type: 'wallet',
  createConnector: (() => {
    const connector = metaMaskConnector({ ...params })
    return connector
  }) as () => CreateConnectorFn
})
