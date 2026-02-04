import { ethers } from 'ethers'
import { getAddress, type Address } from 'viem'
import { createConnector, type Connector } from 'wagmi'

import { normalizeChainId } from '../../utils/helpers.js'

import { EcosystemWalletTransportProvider } from './provider.js'

export interface EcosystemConnector extends Connector {
  type: 'ecosystem-wallet'
  auxData?: Record<string, unknown>
}

export interface BaseEcosystemConnectorOptions {
  projectAccessKey: string
  walletUrl: string
  defaultNetwork: number
  nodesUrl?: string
}

ecosystemWallet.type = 'ecosystem-wallet' as const

type AccountWithCapabilities = {
  address: Address
  capabilities: Record<string, unknown>
}

type ConnectAccounts<withCapabilities extends boolean> = withCapabilities extends true
  ? readonly AccountWithCapabilities[]
  : readonly Address[]

const formatConnectAccounts = <withCapabilities extends boolean>(
  accounts: readonly Address[],
  withCapabilities?: withCapabilities | boolean
): ConnectAccounts<withCapabilities> => {
  if (withCapabilities) {
    return accounts.map(address => ({ address, capabilities: {} })) as unknown as ConnectAccounts<withCapabilities>
  }

  return accounts as ConnectAccounts<withCapabilities>
}

export function ecosystemWallet(params: BaseEcosystemConnectorOptions) {
  type Provider = EcosystemWalletTransportProvider
  type Properties = {
    ecosystemProvider: EcosystemWalletTransportProvider
    auxData?: Record<string, unknown>
  }
  type StorageItem = {}

  const nodesUrl = params.nodesUrl ?? 'https://nodes.sequence.app'

  const ecosystemProvider = new EcosystemWalletTransportProvider(
    params.projectAccessKey,
    params.walletUrl,
    params.defaultNetwork,
    nodesUrl
  )

  return createConnector<Provider, Properties, StorageItem>(config => {
    const getProvider = async (_parameters?: { chainId?: number | undefined }) => ecosystemProvider

    const disconnect = async () => {
      const provider = await getProvider()
      provider.transport.disconnect()
    }

    const getAccounts = async () => {
      const provider = await getProvider()
      const address = provider.transport.getWalletAddress()

      if (address) {
        return [getAddress(address)]
      }

      return []
    }

    const getChainId = async () => {
      const provider = await getProvider()
      return Number(provider.getChainId())
    }

    return {
      id: `ecosystem-wallet`,
      name: 'Ecosystem Wallet',
      type: ecosystemWallet.type,
      ecosystemProvider,
      params,
      auxData: undefined as Record<string, unknown> | undefined,

      async setup() {
        if (typeof window !== 'object') {
          // (for SSR) only run in browser client
          return
        }
      },

      async connect<withCapabilities extends boolean = false>(parameters?: {
        chainId?: number | undefined
        isReconnecting?: boolean | undefined
        withCapabilities?: withCapabilities | boolean | undefined
      }) {
        const provider = await getProvider()
        let walletAddress = provider.transport.getWalletAddress()

        if (!walletAddress) {
          try {
            const res = await provider.transport.connect(this.auxData as Record<string, unknown> | undefined)
            walletAddress = res.walletAddress
          } catch (e) {
            console.log(e)
            await disconnect()
            throw e
          }
        }

        const accounts = [getAddress(walletAddress)]

        return {
          accounts: formatConnectAccounts(accounts, parameters?.withCapabilities),
          chainId: await getChainId()
        }
      },

      disconnect,

      getAccounts,

      getProvider,

      async isAuthorized() {
        const provider = await getProvider()
        return provider.transport.getWalletAddress() !== undefined
      },

      async switchChain({ chainId }) {
        const provider = await getProvider()
        const chain = config.chains.find(c => c.id === chainId) || config.chains[0]

        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.toQuantity(chainId) }]
        })

        config.emitter.emit('change', { chainId })

        return chain
      },

      getChainId,

      async onAccountsChanged(accounts) {
        return { account: accounts[0] }
      },

      async onChainChanged(chain) {
        config.emitter.emit('change', { chainId: normalizeChainId(chain) })
      },

      async onConnect(_connectInfo) {},

      async onDisconnect() {
        await disconnect()
      }
    }
  })
}
