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

    async connect({ withCapabilities, ..._connectInfo } = {}) {
      const provider = (await this.getProvider()) as EcosystemWalletTransportProvider
      let walletAddress = provider.transport.getWalletAddress()

      if (!walletAddress) {
        try {
          const res = await provider.transport.connect(this.auxData as Record<string, unknown> | undefined)
          walletAddress = res.walletAddress
        } catch (e) {
          console.log(e)
          await this.disconnect()
          throw e
        }
      }

      const account = getAddress(walletAddress)

      return {
        // TODO(wagmi v3): `as never` can be removed when wagmi makes `withCapabilities: true` the default
        // see: https://github.com/wevm/wagmi/blob/main/packages/core/src/connectors/createConnector.ts
        // ref: https://github.com/wevm/wagmi/blob/main/packages/connectors/src/safe.ts
        accounts: (withCapabilities ? [{ address: account, capabilities: {} }] : [account]) as never,
        chainId: await this.getChainId()
      }
    },

    async disconnect() {
      const provider = (await this.getProvider()) as EcosystemWalletTransportProvider
      provider.transport.disconnect()
    },

    async getAccounts() {
      const provider = (await this.getProvider()) as EcosystemWalletTransportProvider
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
      const provider = (await this.getProvider()) as EcosystemWalletTransportProvider
      return provider.transport.getWalletAddress() !== undefined
    },

    async switchChain({ chainId }) {
      const provider = (await this.getProvider()) as EcosystemWalletTransportProvider
      const chain = config.chains.find(c => c.id === chainId) || config.chains[0]

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.toQuantity(chainId) }]
      })

      config.emitter.emit('change', { chainId })

      return chain
    },

    async getChainId() {
      const provider = (await this.getProvider()) as EcosystemWalletTransportProvider
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
