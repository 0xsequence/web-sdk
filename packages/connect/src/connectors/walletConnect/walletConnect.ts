import { createConnector } from 'wagmi'
import { walletConnect as walletConnectbase, type WalletConnectParameters } from 'wagmi/connectors'

import type { Wallet } from '../../types.js'

import { WalletConnectLogo } from './WalletConnectLogo.js'

interface WalletConnectOptions extends WalletConnectParameters {
  defaultNetwork?: number
}

const SWITCH_CHAIN_ON_CONNECT_TIMEOUT_MS = 1500

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('WalletConnect switchChain timed out'))
    }, timeoutMs)

    promise.then(
      value => {
        clearTimeout(timeout)
        resolve(value)
      },
      error => {
        clearTimeout(timeout)
        reject(error)
      }
    )
  })
}

export const walletConnect = (options: WalletConnectOptions): Wallet => ({
  id: 'wallet-connect',
  logoDark: WalletConnectLogo,
  logoLight: WalletConnectLogo,
  name: 'WalletConnect',
  type: 'wallet',
  createConnector: () => {
    const { defaultNetwork, ...walletConnectOptions } = options
    const baseConnector = walletConnectbase(walletConnectOptions)

    return createConnector(config => {
      const connector = baseConnector(config)

      const connect = async <withCapabilities extends boolean = false>(params?: {
        chainId?: number
        isReconnecting?: boolean
        withCapabilities?: withCapabilities | boolean
      }) => {
        if (!connector.connect) {
          throw new Error('WalletConnect connector not properly initialized')
        }

        const { chainId, ...connectParams } = params ?? {}
        const result = await connector.connect(connectParams)
        const targetChainId = chainId ?? defaultNetwork

        if (!targetChainId || result.chainId === targetChainId || !connector.switchChain) {
          return result
        }

        try {
          await withTimeout(connector.switchChain({ chainId: targetChainId }), SWITCH_CHAIN_ON_CONNECT_TIMEOUT_MS)

          return {
            accounts: result.accounts,
            chainId: targetChainId
          }
        } catch {
          return result
        }
      }
      return {
        ...connector,
        connect
      }
    })
  }
})
