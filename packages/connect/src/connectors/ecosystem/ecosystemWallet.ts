import { ethers } from 'ethers'
import { getAddress } from 'viem'
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

  return createConnector<Provider, Properties, StorageItem>(config => ({
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

    async connect(_connectInfo) {
      const provider = await this.getProvider()
      let walletAddress = provider.transport.getWalletAddress()

      if (!walletAddress) {
        try {
          const res = await provider.transport.connect(this.auxData)
          walletAddress = res.walletAddress
        } catch (e) {
          console.log(e)
          await this.disconnect()
          throw e
        }
      }

      return {
        accounts: [getAddress(walletAddress)],
        chainId: await this.getChainId()
      }
    },

    async disconnect() {
      const provider = await this.getProvider()
      provider.transport.disconnect()
    },

    async getAccounts() {
      const provider = await this.getProvider()
      const address = provider.transport.getWalletAddress()

      if (address) {
        return [getAddress(address)]
      }

      return []
    },

    async getProvider(): Promise<EcosystemWalletTransportProvider> {
      return ecosystemProvider
    },

    async isAuthorized() {
      const provider = await this.getProvider()
      return provider.transport.getWalletAddress() !== undefined
    },

    async switchChain({ chainId }) {
      const provider = await this.getProvider()
      const chain = config.chains.find(c => c.id === chainId) || config.chains[0]

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.toQuantity(chainId) }]
      })

      config.emitter.emit('change', { chainId })

      return chain
    },

    async getChainId() {
      const provider = await this.getProvider()
      return Number(provider.getChainId())
    },

    async onAccountsChanged(accounts) {
      return { account: accounts[0] }
    },

    async onChainChanged(chain) {
      config.emitter.emit('change', { chainId: normalizeChainId(chain) })
    },

    async onConnect(_connectInfo) {},

    async onDisconnect() {
      await this.disconnect()
    }
  }))
}
