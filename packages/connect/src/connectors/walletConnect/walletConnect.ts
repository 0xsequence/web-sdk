import { createConnector } from 'wagmi'
import { walletConnect as walletConnectbase, type WalletConnectParameters } from 'wagmi/connectors'

import type { Wallet } from '../../types.js'

import { WalletConnectLogo } from './WalletConnectLogo.js'

interface WalletConnectOptions extends WalletConnectParameters {
  defaultNetwork?: number
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

      const connect = async (params?: { chainId?: number }) => {
        const targetChainId = params?.chainId ?? defaultNetwork ?? config.chains[0]?.id
        if (!targetChainId) {
          throw new Error('No target chain ID available')
        }

        if (!connector.connect || !connector.switchChain) {
          throw new Error('WalletConnect connector not properly initialized')
        }

        // First establish the basic connection
        const result = await connector.connect()

        // Only attempt to switch chains if we're not already on the target chain
        if (result.chainId !== targetChainId) {
          try {
            // Switch to the target chain
            await connector.switchChain({ chainId: targetChainId })

            // Return the connection with the updated chain
            return {
              accounts: result.accounts,
              chainId: targetChainId
            }
          } catch (error) {
            console.warn('Failed to switch chain:', error)
            return result
          }
        }

        return result
      }

      return {
        ...connector,
        connect
      }
    })
  }
})
