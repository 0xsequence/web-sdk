import { CreateConnectorFn } from 'wagmi'
import { coinbaseWallet as coinbaseWalletBase, CoinbaseWalletParameters } from 'wagmi/connectors'

import { CoinbaseWalletLogo } from './CoinbaseWalletLogo'

export const coinbaseWallet = (params: CoinbaseWalletParameters) => ({
  id: 'coinbase-wallet',
  logoDark: CoinbaseWalletLogo,
  logoLight: CoinbaseWalletLogo,
  name: 'Coinbase Wallet',
  createConnector: (() => {
    const connector = coinbaseWalletBase({ ...params })
    return connector
  }) as () => CreateConnectorFn
})
