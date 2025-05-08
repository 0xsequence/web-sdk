import type { CreateConnectorFn } from 'wagmi'
import { coinbaseWallet as coinbaseWalletBase, type CoinbaseWalletParameters } from 'wagmi/connectors'

import type { Wallet } from '../../types.js'

import { CoinbaseWalletLogo } from './CoinbaseWalletLogo.js'

export const coinbaseWallet = (params: CoinbaseWalletParameters): Wallet => ({
  id: 'coinbase-wallet',
  logoDark: CoinbaseWalletLogo,
  logoLight: CoinbaseWalletLogo,
  name: 'Coinbase Wallet',
  type: 'wallet',
  createConnector: (() => {
    const connector = coinbaseWalletBase({ ...params })
    return connector
  }) as () => CreateConnectorFn
})
