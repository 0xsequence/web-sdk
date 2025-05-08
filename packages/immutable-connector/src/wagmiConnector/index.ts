import { Environment } from '@imtbl/config'
import { passport } from '@imtbl/sdk'
import type { Address } from 'viem'
import { createConnector } from 'wagmi'

export interface BaseImmutableConnectorOptions {
  passportInstance: passport.Passport
  environment: Environment
}

immutableConnector.type = 'immutable' as const

export function immutableConnector(params: BaseImmutableConnectorOptions) {
  type Provider = passport.Provider
  type Properties = {
    params: BaseImmutableConnectorOptions
  }
  type StorageItem = {}

  let provider: Provider | undefined = undefined

  const IMMUTABLE_CHAINS = {
    [Environment.SANDBOX]: 13473,
    [Environment.PRODUCTION]: 13371
  } as const

  const { passportInstance, environment } = params

  return createConnector<Provider, Properties, StorageItem>(config => ({
    id: 'immutable',
    name: 'Immutable',
    type: 'immutable',
    params,
    passportInstance,

    async setup() {},

    async connect() {
      provider = await passportInstance.connectEvm({
        announceProvider: false
      })
      const accounts = await this.getAccounts()
      const chainId = await this.getChainId()
      return { accounts, chainId }
    },

    async disconnect() {
      await passportInstance.logout()
      provider = undefined
      config.emitter.emit('disconnect')
    },

    async getAccounts() {
      const provider = (await this.getProvider()) as Provider
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      })
      return [accounts[0] as Address]
    },

    async getProvider() {
      const userProfile = await passportInstance.login({ useCachedSession: true })
      if (!userProfile && !provider) {
        throw new Error('Provider not initialized')
      }
      if (!provider) {
        provider = await passportInstance.connectEvm({
          announceProvider: false
        })
      }
      return provider
    },

    async isAuthorized() {
      try {
        if (!provider) {
          return false
        }
        const accounts = await provider.request({
          method: 'eth_requestAccounts'
        })
        return Boolean(accounts[0])
      } catch {
        return false
      }
    },

    async switchChain() {
      throw new Error('Chain switching is not supported by Immutable Passport')
    },

    async getChainId() {
      return IMMUTABLE_CHAINS[environment]
    },

    async onAccountsChanged(accounts) {
      return { account: accounts[0] }
    },

    async onChainChanged() {},

    async onConnect(_connectinfo) {},

    async onDisconnect() {
      config.emitter.emit('disconnect')
    }
  }))
}
