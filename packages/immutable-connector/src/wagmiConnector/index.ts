import { createConnector } from 'wagmi'
import { passport, config } from '@imtbl/sdk'

export interface BaseImmutableConnectorOptions {}

immutableConnector.type = 'immutable' as const

export function immutableConnector(params: BaseImmutableConnectorOptions) {
  type Provider = any
  type Properties = {
    params: BaseImmutableConnectorOptions
  }
  type StorageItem = {}

  let provider: any = undefined

  return createConnector<Provider, Properties, StorageItem>(config => ({
    id: 'immutable',
    name: 'Immutable Passport',
    type: immutableConnector.type,
    params,

    async setup() {
      const passportInstance = new passport.Passport({
        baseConfig: {
          // latest immutable SDK is missing the environment config from the docs
          // @ts-ignore-next-line
          environment: 'sandbox',
          publishableKey: 'pk_imapik-test-lnUqNu5uDYfKDz_stwpN'
        },
        clientId: '420lberPuiZaO6SBX6Anoa7C9kpcsuer',
        redirectUri: 'http://localhost:4444', // replace with one of your redirect URIs from Hub
        logoutRedirectUri: 'http://localhost:4444', // replace with one of your logout URIs from Hub
        audience: 'platform_api',
        scope: 'openid offline_access email transact',
      });
    },

    async connect() {
      const provider = await this.getProvider()

      return { accounts: [], chainId: 1 }
    },

    async disconnect() {
      const provider = await this.getProvider()

      provider.disconnect()
    },

    async getAccounts() {
      const provider = await this.getProvider()

      return []
    },

    async getProvider() {
      if (provider) {
        return provider
      }

      // return the immutable passport provider
      provider = {}
    },

    async isAuthorized() {
      return false
      // try {
      //   const account = await this.getAccounts()
      //   return !!account
      // } catch (e) {
      //   return false
      // }
    },

    async switchChain({ chainId }) {
      const provider = await this.getProvider()

      const chain = config.chains.find(c => c.id === chainId) || config.chains[0]

      config.emitter.emit('change', { chainId })

      return chain
    },

    async getChainId() {
      const provider = await this.getProvider()
      const chainId = provider.getChainId()

      return chainId
    },

    async onAccountsChanged(accounts) {
      return { account: accounts[0] }
    },

    async onChainChanged(chain) {
      const provider = await this.getProvider()

      config.emitter.emit('change', { chainId: normalizeChainId(chain) })
    },

    async onConnect(_connectinfo) {},

    async onDisconnect() {
      config.emitter.emit('disconnect')
    }
  }))
}

function normalizeChainId(chainId: string | number | bigint | { chainId: string }) {
  if (typeof chainId === 'object') return normalizeChainId(chainId.chainId)
  if (typeof chainId === 'string') return Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10)
  if (typeof chainId === 'bigint') return Number(chainId)
  return chainId
}