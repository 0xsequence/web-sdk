import { CreateConnectorFn } from 'wagmi'
import { CoinbaseWalletParameters, coinbaseWallet as coinbaseWalletBase } from 'wagmi/connectors'

import { Wallet } from '../../types'
import { CoinbaseWalletLogo } from './CoinbaseWalletLogo'

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
