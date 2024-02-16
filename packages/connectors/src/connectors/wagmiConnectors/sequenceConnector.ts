import { sequence } from '0xsequence'
import { LocalStorageKey, EthAuthSettings } from '@0xsequence/kit'

import { UserRejectedRequestError, getAddress } from 'viem'

import { createConnector } from 'wagmi'

export interface BaseSequenceConnectorOptions {
  walletAppURL?: string
  defaultNetwork?: sequence.network.ChainIdLike
  connect: sequence.provider.ConnectOptions
}

sequenceWallet.type = 'sequence' as const

export function sequenceWallet(params: BaseSequenceConnectorOptions) {
  const { defaultNetwork, connect, walletAppURL } = params

  let id = 'sequence'
  let name = 'Sequence'

  const signInOptions = params?.connect?.settings?.signInOptions || []
  const signInWith = params?.connect?.settings?.signInWith
  const signInWithEmail = params?.connect?.settings?.signInWithEmail

  // If there are no sign in options
  // Then it must mean we are connecting with email
  if (signInWithEmail) {
    id = 'email'
    name = 'Email'
  } else if (signInWith) {
    id = signInWith
    name = `${signInWith[0].toUpperCase()}${signInWith.slice(1)}`
  } else if (signInOptions.length > 0) {
    const newId = signInOptions[0]
    const newName = `${id[0].toUpperCase()}${id.slice(1)}`
    id = newId
    name = newName
  }

  type Provider = sequence.provider.SequenceProvider
  type Properties = {}

  return createConnector<Provider, Properties>(config => ({
    id: 'sequence',
    name: 'Sequence',
    type: sequenceWallet.type,
    async setup() {
      const provider = await this.getProvider()
      provider.on('chainChanged', (chainIdHex: string) => {
        config.emitter.emit('change', { chainId: normalizeChainId(chainIdHex) })
      })

      provider.on('disconnect', () => {
        this.onDisconnect()
      })
    },
    async connect() {
      const provider = (await this.getProvider()) as sequence.provider.SequenceProvider

      if (!provider.isConnected()) {
        const localStorageTheme = localStorage.getItem(LocalStorageKey.Theme)
        const ethAuthSettingsRaw = localStorage.getItem(LocalStorageKey.EthAuthSettings)
        const parseEthAuthSettings = ethAuthSettingsRaw ? JSON.parse(ethAuthSettingsRaw) : ({} as EthAuthSettings)

        const connectOptionsWithTheme = {
          authorize: true,
          ...parseEthAuthSettings,
          ...connect,
          settings: {
            theme: localStorageTheme || 'dark',
            ...connect?.settings
          }
        }

        const e = await provider.connect(connectOptionsWithTheme)
        if (e.error) {
          throw new UserRejectedRequestError(new Error(e.error))
        }
        if (!e.connected) {
          throw new UserRejectedRequestError(new Error('Wallet connection rejected'))
        }

        const proofString = e.proof?.proofString
        const proofTypedData = e.proof?.typedData
        if (proofString) {
          const jsonEthAuthProof = JSON.stringify({
            proofString,
            typedData: proofTypedData
          })

          localStorage.setItem(LocalStorageKey.EthAuthProof, jsonEthAuthProof)
        }
      }

      const accounts = await this.getAccounts()

      return {
        accounts: [...accounts],
        chainId: provider.getChainId()
      }
    },
    async disconnect() {
      const provider = await this.getProvider()

      provider.disconnect()
    },
    async getAccounts() {
      const provider = await this.getProvider()

      const account = getAddress((await provider.getSigner().getAddress()) as `0x${string}`)

      return [account]
    },
    async getProvider(): Promise<sequence.provider.SequenceProvider> {
      try {
        const provider = sequence.getWallet()

        return provider
      } catch (e) {
        const projectAccessKey = localStorage.getItem(LocalStorageKey.ProjectAccessKey)

        if (!projectAccessKey) {
          throw 'projectAccessKey not found'
        }

        const provider = sequence.initWallet(projectAccessKey, {
          defaultNetwork,
          transports: {
            walletAppURL: walletAppURL || 'https://sequence.app'
          },
          defaultEIP6492: true,
          analytics: false
        })

        const chainId = await provider.getChainId()
        config.emitter.emit('change', { chainId: normalizeChainId(chainId) })

        return provider
      }
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
      const provider = (await this.getProvider()) as sequence.provider.SequenceProvider

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
    async onConnect(connectinfo) {},
    async onDisconnect() {
      localStorage.removeItem(LocalStorageKey.EthAuthProof)
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
