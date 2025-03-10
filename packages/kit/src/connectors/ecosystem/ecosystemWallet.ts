import { ethers } from 'ethers'
import { getAddress } from 'viem'
import { createConnector } from 'wagmi'

import { EcosystemWalletTransportProvider } from './provider'

export interface BaseEcosystemConnectorOptions {
  projectAccessKey: string
  walletUrl: string
  defaultNetwork: number
  isDev?: boolean
}

ecosystemWallet.type = 'ecosystem-wallet' as const

export function ecosystemWallet(params: BaseEcosystemConnectorOptions) {
  type Provider = EcosystemWalletTransportProvider
  type Properties = {
    ecosystemProvider: EcosystemWalletTransportProvider
  }
  type StorageItem = {}

  const isDev = !!params?.isDev
  const nodesUrl = isDev ? 'https://dev-nodes.sequence.app' : 'https://nodes.sequence.app'

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

    async setup() {
      if (typeof window !== 'object') {
        // (for SSR) only run in browser client
        return
      }
    },

    async connect(
      parameters?: { chainId?: number | undefined; isReconnecting?: boolean | undefined },
      auxData?: Record<string, unknown>
    ) {
      const provider = await this.getProvider()
      let walletAddress = provider.transport.getWalletAddress()

      if (!walletAddress) {
        try {
          const res = await provider.transport.connect(auxData)
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

function normalizeChainId(chainId: string | number | bigint | { chainId: string }) {
  if (typeof chainId === 'object') return normalizeChainId(chainId.chainId)
  if (typeof chainId === 'string') return Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10)
  if (typeof chainId === 'bigint') return Number(chainId)
  return chainId
}
