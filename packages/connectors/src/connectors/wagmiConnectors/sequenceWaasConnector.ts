import { SequenceWaaS, SequenceConfig, ExtendedSequenceConfig, defaults } from '@0xsequence/waas'
import { SequenceSigner } from '@0xsequence/waas-ethers'
import { LocalStorageKey } from '@0xsequence/kit'

import { getAddress } from 'viem'

import { createConnector } from 'wagmi'
import { ethers } from 'ethers'
import { EIP1193Provider } from '0xsequence/dist/declarations/src/provider'

export interface SequenceWaasConnectConfig {
  googleClientId?: string
}

export interface BaseSequenceWaasConnectorOptions {
  config: SequenceConfig & SequenceWaasConnectConfig & Partial<ExtendedSequenceConfig>
}

sequenceWaasWallet.type = 'sequence-waas' as const

export function sequenceWaasWallet(params: BaseSequenceWaasConnectorOptions) {
  const waasConfig = params.config

  type Provider = SequenceWaasProvider
  type Properties = {}

  const sequenceWaas = new SequenceWaaS(
    {
      network: 'polygon',
      projectAccessKey: waasConfig.projectAccessKey,
      waasConfigKey: waasConfig.waasConfigKey
    },
    defaults.TEST
  )

  const sequenceSignerProvider = new ethers.providers.JsonRpcProvider(
    `https://next-nodes.sequence.app/polygon/${waasConfig.projectAccessKey}`
  )

  const sequenceWaasProvider = new SequenceWaasProvider(sequenceWaas, sequenceSignerProvider)

  return createConnector<Provider, Properties>(config => ({
    id: 'sequence-waas',
    name: 'SequenceWaaS',
    type: sequenceWaasWallet.type,
    async setup() {
      const isConnected = await sequenceWaas.isSignedIn()
      if (!isConnected) {
        const sessionHash = await sequenceWaas.getSessionHash()
        localStorage.setItem(LocalStorageKey.WaasSessionHash, sessionHash)
      }
    },
    async connect() {
      console.log('connect called')

      const isConnected = await sequenceWaas.isSignedIn()

      if (isConnected) {
        const accounts = await this.getAccounts()
        const provider = await this.getProvider()

        console.log('accounts', accounts)
        console.log('provider', provider)

        return {
          accounts: [...accounts],
          chainId: provider.getChainId()
        }
      } else {
        const idToken = localStorage.getItem(LocalStorageKey.GoogleIDToken)
        console.log('idToken', idToken)
        if (waasConfig.googleClientId && idToken) {
          await sequenceWaas.signIn({ idToken }, 'asdasasdad111')
          localStorage.removeItem(LocalStorageKey.GoogleIDToken)

          console.log('address', await sequenceWaas.getAddress())

          const accounts = await this.getAccounts()
          const provider = await this.getProvider()

          return {
            accounts: [...accounts],
            chainId: provider.getChainId()
          }
        }
      }
    },
    async disconnect() {
      config.emitter.emit('disconnect')
      try {
        await sequenceWaas.dropSession({ sessionId: await sequenceWaas.getSessionId() })
      } catch (e) {
        console.log(e)
      }
      localStorage.removeItem(LocalStorageKey.WaasSessionHash)
    },
    async getAccounts() {
      const address = await sequenceWaas.getAddress()

      return [getAddress(address)]
    },
    async getProvider(): Promise<SequenceWaasProvider> {
      return sequenceWaasProvider
    },
    async isAuthorized() {
      try {
        const account = await this.getAccounts()
        return !!account
      } catch (e) {
        return false
      }
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider()

      const chain = config.chains.find(c => c.id === chainId) || config.chains[0]
      provider.setDefaultChainId(normalizeChainId(chainId))

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
      provider.setDefaultChainId(normalizeChainId(chain))
    },
    async onConnect(connectinfo) {
      console.log('onConnect connectInfo', connectinfo)
    }
    // async onDisconnect() {
    //   try {
    //     await sequenceWaas.dropSession({ sessionId: await sequenceWaas.getSessionId() })
    //   } catch (e) {
    //     console.log(e)
    //   }
    //   localStorage.removeItem(LocalStorageKey.WaasSessionHash)
    //   config.emitter.emit('disconnect')
    // }
  }))
}

function normalizeChainId(chainId: string | number | bigint | { chainId: string }) {
  if (typeof chainId === 'object') return normalizeChainId(chainId.chainId)
  if (typeof chainId === 'string') return Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10)
  if (typeof chainId === 'bigint') return Number(chainId)
  return chainId
}

export class SequenceWaasProvider extends SequenceSigner implements EIP1193Provider {
  async request({ method, params }: { method: string; params: any[] }) {
    if (method === 'eth_accounts') {
      const address = await this.getAddress()

      const account = getAddress(address)

      console.log('eth_accounts', account)

      return [account]
    }

    if (method === 'eth_sendTransaction') {
      console.log('send txn', params)
      const txnResult = await this.sendTransaction(params[0])
      return txnResult
    }

    if (
      method === 'eth_sign' ||
      method === 'eth_signTypedData' ||
      method === 'eth_signTypedData_v4' ||
      method === 'personal_sign' ||
      // These methods will use EIP-6492
      // but this is handled directly by the wallet
      method === 'sequence_sign' ||
      method === 'sequence_signTypedData_v4'
    ) {
      const sig = await this.signMessage(params[0])

      return sig
    }
  }

  async disconnect() {
    return
  }
}
