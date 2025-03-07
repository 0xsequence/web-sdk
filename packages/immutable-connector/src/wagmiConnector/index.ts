import { passport } from '@imtbl/sdk'
import { Environment } from '@imtbl/config'
import { type IMXProvider } from '@imtbl/x-provider'
import { type Address } from 'viem'
import { createConnector } from 'wagmi'

export interface BaseImmutableConnectorOptions {
  environment?: Environment,
  redirectUri?: string,
  logoutRedirectUri?: string,
  publishableKey?: string,
  clientId?: string,
}

immutableConnector.type = 'immutable' as const

export function immutableConnector(params: BaseImmutableConnectorOptions) {
  type Provider = IMXProvider
  type Properties = {
    params: BaseImmutableConnectorOptions
  }
  type StorageItem = {}

  let provider: IMXProvider | undefined = undefined

  const IMMUTABLE_CHAINS = {
    [Environment.SANDBOX]: 13473,
    [Environment.PRODUCTION]: 13371
  } as const;

  const { environment = Environment.SANDBOX } = params

  const passportInstance = new passport.Passport({
    baseConfig: {
      environment,
      publishableKey: params.publishableKey || 'pk_imapik-test-lnUqNu5uDYfKDz_stwpN'
    },
    clientId: params.clientId || '420lberPuiZaO6SBX6Anoa7C9kpcsuer',
    redirectUri: params.redirectUri || window.location.origin,
    logoutRedirectUri: params.logoutRedirectUri,
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
  });

  return createConnector<Provider, Properties, StorageItem>(config => ({
    id: 'immutable',
    name: 'Immutable Passport',
    type: immutableConnector.type,
    params,
    passportInstance,

    async setup() {
    },

    async connect() {
      await passportInstance.login({ useCachedSession: true });
    
      const provider = (await this.getProvider()) as IMXProvider;

      const isRegistered = await provider.isRegisteredOffchain();
      if (!isRegistered) {
        await provider.registerOffchain();
      }

      const accounts = await this.getAccounts();
      const chainId = await this.getChainId();

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
      if (provider) {
        return provider
      }

      provider = await passportInstance.connectImx();

      return provider 
    },

    async isAuthorized() {
      try {
        const provider = await this.getProvider();
        const address = await provider.getAddress();
        return Boolean(address);
      } catch {
        return false;
      }
    },

    async switchChain() {
      throw new Error('Chain switching is not supported by Immutable Passport');
    },

    async getChainId() {
      return IMMUTABLE_CHAINS[environment]
    },

    async onAccountsChanged(accounts) {
      return { account: accounts[0] }
    },

    async onChainChanged() {
    },

    async onConnect(_connectinfo) {},

    async onDisconnect() {
      config.emitter.emit('disconnect')
    }
  }))
}
