import { createConnector } from 'wagmi'
import { walletConnect as walletConnectbase, type WalletConnectParameters } from 'wagmi/connectors'
import type { Address } from 'viem'

import type { Wallet } from '../../types.js'

import { WalletConnectLogo } from './WalletConnectLogo.js'

interface WalletConnectOptions extends WalletConnectParameters {
  defaultNetwork?: number
}

type AccountWithCapabilities = {
  address: Address
  capabilities: Record<string, unknown>
}

type ConnectAccounts<withCapabilities extends boolean> = withCapabilities extends true
  ? readonly AccountWithCapabilities[]
  : readonly Address[]

const isAccountWithCapabilities = (account: Address | AccountWithCapabilities): account is AccountWithCapabilities => {
  return typeof account === 'object' && account !== null && 'address' in account
}

const normalizeConnectAccounts = <withCapabilities extends boolean>(
  accounts: readonly (Address | AccountWithCapabilities)[],
  withCapabilities?: withCapabilities | boolean
): ConnectAccounts<withCapabilities> => {
  if (withCapabilities) {
    if (accounts.length > 0 && isAccountWithCapabilities(accounts[0])) {
      return accounts as ConnectAccounts<withCapabilities>
    }

    return (accounts as readonly Address[]).map(address => ({
      address,
      capabilities: {}
    })) as unknown as ConnectAccounts<withCapabilities>
  }

  if (accounts.length > 0 && isAccountWithCapabilities(accounts[0])) {
    return (accounts as readonly AccountWithCapabilities[]).map(
      account => account.address
    ) as unknown as ConnectAccounts<withCapabilities>
  }

  return accounts as ConnectAccounts<withCapabilities>
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
        chainId?: number | undefined
        isReconnecting?: boolean | undefined
        withCapabilities?: withCapabilities | boolean | undefined
      }) => {
        const targetChainId = params?.chainId ?? defaultNetwork ?? config.chains[0]?.id
        if (!targetChainId) {
          throw new Error('No target chain ID available')
        }

        if (!connector.connect || !connector.switchChain) {
          throw new Error('WalletConnect connector not properly initialized')
        }

        // First establish the basic connection
        const result = await connector.connect({
          chainId: targetChainId,
          isReconnecting: params?.isReconnecting,
          withCapabilities: params?.withCapabilities
        })

        // Only attempt to switch chains if we're not already on the target chain
        if (result.chainId !== targetChainId) {
          try {
            // Switch to the target chain
            await connector.switchChain({ chainId: targetChainId })

            // Return the connection with the updated chain
            return {
              accounts: normalizeConnectAccounts(result.accounts, params?.withCapabilities),
              chainId: targetChainId
            }
          } catch (error) {
            console.warn('Failed to switch chain:', error)
            return {
              accounts: normalizeConnectAccounts(result.accounts, params?.withCapabilities),
              chainId: result.chainId
            }
          }
        }

        return {
          accounts: normalizeConnectAccounts(result.accounts, params?.withCapabilities),
          chainId: result.chainId
        }
      }

      return {
        ...connector,
        connect
      }
    })
  }
})
