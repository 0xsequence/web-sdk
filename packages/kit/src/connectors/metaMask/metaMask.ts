import { CreateConnectorFn } from 'wagmi'
import { MetaMaskParameters, metaMask as metaMaskConnector } from 'wagmi/connectors'

import { Wallet } from '../../types'

import { MetaMaskLogo } from './MetaMaskLogo'

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
