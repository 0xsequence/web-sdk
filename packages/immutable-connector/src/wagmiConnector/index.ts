import { Environment } from '@imtbl/config'
import { passport } from '@imtbl/sdk'
import { type IMXProvider } from '@imtbl/x-provider'
import { type Address } from 'viem'
import { createConnector } from 'wagmi'

export interface BaseImmutableConnectorOptions {
  passportInstance: passport.Passport
  environment: Environment
}

immutableConnector.type = 'immutable' as const

export function immutableConnector(params: BaseImmutableConnectorOptions) {
  console.log('Immutable connector created')

  type Provider = IMXProvider
  type Properties = {
    params: BaseImmutableConnectorOptions
  }
  type StorageItem = {}

  let provider: IMXProvider | undefined = undefined

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
      provider = await passportInstance.connectImx()

      const isRegistered = await provider.isRegisteredOffchain()
      if (!isRegistered) {
        await provider.registerOffchain()
      }

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
      const provider = (await this.getProvider()) as IMXProvider

      const account = await provider.getAddress()

      return [account as Address]
    },

    async getProvider(): Promise<IMXProvider> {
      if (!provider) {
        const userProfile = await passportInstance.login({ useCachedSession: true })
        if (userProfile) {
          provider = await passportInstance.connectImx()
          return provider
        }
        throw new Error('Provider not initialized')
      }
      return provider
    },

    async isAuthorized() {
      try {
        if (!provider) {
          return false
        }
        const address = await provider.getAddress()
        return Boolean(address)
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
