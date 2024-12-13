import { createConnector } from 'wagmi'
import { walletConnect as walletConnectbase, WalletConnectParameters } from 'wagmi/connectors'

import { Wallet } from '../../types'

import { WalletConnectLogo } from './WalletConnectLogo'

export const walletConnect = (options: WalletConnectParameters): Wallet => ({
  id: 'wallet-connect',
  logoDark: WalletConnectLogo,
  logoLight: WalletConnectLogo,
  name: 'Walletconnect',
  type: 'wallet',
  createConnector: () => {
    const baseConnector = walletConnectbase(options)

    return createConnector(config => {
      const connector = baseConnector(config)

      const connect = async (params?: { chainId?: number }) => {
        const targetChainId = params?.chainId ?? config.chains[0]?.id
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
