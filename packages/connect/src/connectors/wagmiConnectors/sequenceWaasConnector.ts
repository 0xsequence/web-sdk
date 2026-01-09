import { allNetworks, type EIP1193Provider } from '@0xsequence/network'
import {
  SequenceWaaS,
  WebrpcEndpointError,
  type ExtendedSequenceConfig,
  type FeeOption,
  type SequenceConfig,
  type SignInResponse,
  type Transaction
} from '@0xsequence/waas'
import { v4 as uuidv4 } from 'uuid'
import {
  getAddress,
  InternalRpcError,
  ProviderDisconnectedError,
  toHex,
  TransactionRejectedRpcError,
  UserRejectedRequestError,
  zeroAddress
} from 'viem'
import { createConnector } from 'wagmi'

import { LocalStorageKey } from '../../constants/localStorage.js'
import { normalizeChainId } from '../../utils/helpers.js'
import { getPkcePair, getXOauthUrl } from '../X/XAuth.js'

export interface SequenceWaasConnectConfig {
  googleClientId?: string
  appleClientId?: string
  XClientId?: string
  XRedirectURI?: string
  epicAuthUrl?: string
  appleRedirectURI?: string
  enableConfirmationModal?: boolean
  nodesUrl?: string
  loginType: 'email' | 'google' | 'apple' | 'epic' | 'X' | 'guest'
}

export type BaseSequenceWaasConnectorOptions = SequenceConfig & SequenceWaasConnectConfig & Partial<ExtendedSequenceConfig>

sequenceWaasWallet.type = 'sequence-waas' as const

export function sequenceWaasWallet(params: BaseSequenceWaasConnectorOptions) {
  type Provider = SequenceWaasProvider
  type Properties = {
    sequenceWaas: SequenceWaaS
    sequenceWaasProvider: SequenceWaasProvider
    params: BaseSequenceWaasConnectorOptions
  }
  type StorageItem = {
    [LocalStorageKey.WaasActiveLoginType]: string
    [LocalStorageKey.WaasGoogleIdToken]: string
    [LocalStorageKey.WaasEmailIdToken]: string
    [LocalStorageKey.WaasAppleIdToken]: string
    [LocalStorageKey.WaasXAuthUrl]: string
    [LocalStorageKey.WaasXClientID]: string
    [LocalStorageKey.WaasXRedirectURI]: string
    [LocalStorageKey.WaasXCodeVerifier]: string
    [LocalStorageKey.WaasXIdToken]: string
    [LocalStorageKey.WaasGoogleClientID]: string
    [LocalStorageKey.WaasAppleClientID]: string
    [LocalStorageKey.WaasAppleRedirectURI]: string
    [LocalStorageKey.WaasEpicAuthUrl]: string
    [LocalStorageKey.WaasEpicIdToken]: string
    [LocalStorageKey.WaasSignInEmail]: string
  }

  const nodesUrl = params.nodesUrl ?? 'https://nodes.sequence.app'

  const showConfirmationModal = params.enableConfirmationModal ?? false

  const sequenceWaas = new SequenceWaaS({
    waasConfigKey: params.waasConfigKey,
    projectAccessKey: params.projectAccessKey,
    network: params.network ?? 137
  })

  const sequenceWaasProvider = new SequenceWaasProvider(sequenceWaas, showConfirmationModal, nodesUrl)

  return createConnector<Provider, Properties, StorageItem>(config => ({
    id: `sequence-waas`,
    name: 'Sequence WaaS',
    type: sequenceWaasWallet.type,
    sequenceWaas,
    sequenceWaasProvider,
    params,

    async setup() {
      if (typeof window !== 'object') {
        return
      }

      if (params.googleClientId) {
        await config.storage?.setItem(LocalStorageKey.WaasGoogleClientID, params.googleClientId)
      }
      if (params.appleClientId) {
        await config.storage?.setItem(LocalStorageKey.WaasAppleClientID, params.appleClientId)
      }
      if (params.appleRedirectURI) {
        await config.storage?.setItem(LocalStorageKey.WaasAppleRedirectURI, params.appleRedirectURI)
      }
      if (params.epicAuthUrl) {
        await config.storage?.setItem(LocalStorageKey.WaasEpicAuthUrl, params.epicAuthUrl)
      }
      if (params.XClientId && params.XRedirectURI) {
        const { code_challenge, code_verifier } = await getPkcePair()
        const authUrl = await getXOauthUrl(params.XClientId, params.XRedirectURI, code_challenge)
        await config.storage?.setItem(LocalStorageKey.WaasXAuthUrl, authUrl)
        await config.storage?.setItem(LocalStorageKey.WaasXClientID, params.XClientId)
        await config.storage?.setItem(LocalStorageKey.WaasXRedirectURI, params.XRedirectURI)
        await config.storage?.setItem(LocalStorageKey.WaasXCodeVerifier, code_verifier)
      }

      sequenceWaasProvider.on('error', error => {
        if (isSessionInvalidOrNotFoundError(error)) {
          this.disconnect()
        }
      })
    },

    async connect<withCapabilities extends boolean = false>(_connectInfo?: {
      chainId?: number
      isReconnecting?: boolean
      withCapabilities?: withCapabilities | boolean
    }) {
      const provider = await this.getProvider()
      const isSignedIn = await provider.sequenceWaas.isSignedIn()

      if (!isSignedIn) {
        const googleIdToken = await config.storage?.getItem(LocalStorageKey.WaasGoogleIdToken)
        const emailIdToken = await config.storage?.getItem(LocalStorageKey.WaasEmailIdToken)
        const appleIdToken = await config.storage?.getItem(LocalStorageKey.WaasAppleIdToken)
        const epicIdToken = await config.storage?.getItem(LocalStorageKey.WaasEpicIdToken)
        const xIdToken = await config.storage?.getItem(LocalStorageKey.WaasXIdToken)

        let idToken: string | undefined

        if (params.loginType === 'google' && googleIdToken) {
          idToken = googleIdToken
        } else if (params.loginType === 'email' && emailIdToken) {
          idToken = emailIdToken
        } else if (params.loginType === 'apple' && appleIdToken) {
          idToken = appleIdToken
        } else if (params.loginType === 'epic' && epicIdToken) {
          idToken = epicIdToken
        } else if (params.loginType === 'X' && xIdToken) {
          idToken = xIdToken
        }

        await config.storage?.removeItem(LocalStorageKey.WaasGoogleIdToken)
        await config.storage?.removeItem(LocalStorageKey.WaasEmailIdToken)
        await config.storage?.removeItem(LocalStorageKey.WaasAppleIdToken)
        await config.storage?.removeItem(LocalStorageKey.WaasEpicIdToken)
        await config.storage?.removeItem(LocalStorageKey.WaasXIdToken)

        if (idToken) {
          try {
            let signInResponse: SignInResponse | undefined

            if (params.loginType === 'X') {
              signInResponse = await provider.sequenceWaas.signIn({ xAccessToken: idToken }, randomName())
            } else {
              signInResponse = await provider.sequenceWaas.signIn({ idToken }, randomName())
            }

            if (signInResponse?.email) {
              await config.storage?.setItem(LocalStorageKey.WaasSignInEmail, signInResponse.email)
            }
          } catch (e) {
            console.log(e)
            await this.disconnect()
            throw e
          }
        }
      }

      const accounts = await this.getAccounts()
      const resolvedAccounts = (
        _connectInfo?.withCapabilities ? accounts.map(address => ({ address, capabilities: {} })) : accounts
      ) as never

      if (accounts.length) {
        await config.storage?.setItem(LocalStorageKey.WaasActiveLoginType, params.loginType)
      } else {
        throw new Error('No accounts found')
      }

      return {
        accounts: resolvedAccounts,
        chainId: await this.getChainId()
      }
    },

    async disconnect() {
      const provider = await this.getProvider()

      try {
        await provider.sequenceWaas.dropSession({ sessionId: await provider.sequenceWaas.getSessionId(), strict: false })
      } catch (e) {
        console.log(e)
      }

      await config.storage?.removeItem(LocalStorageKey.WaasActiveLoginType)
      await config.storage?.removeItem(LocalStorageKey.WaasSignInEmail)

      config.emitter.emit('disconnect')
    },

    async getAccounts() {
      const provider = await this.getProvider()

      try {
        const isSignedIn = await provider.sequenceWaas.isSignedIn()

        if (isSignedIn) {
          const address = await provider.sequenceWaas.getAddress()
          return [getAddress(address)]
        }
      } catch (err) {
        return []
      }

      return []
    },

    async getProvider(): Promise<SequenceWaasProvider> {
      return sequenceWaasProvider
    },

    async isAuthorized() {
      const provider = await this.getProvider()

      const activeWaasOption = await config.storage?.getItem(LocalStorageKey.WaasActiveLoginType)
      if (params.loginType !== activeWaasOption) {
        return false
      }
      try {
        return await provider.sequenceWaas.isSignedIn()
      } catch (e) {
        return false
      }
    },

    async switchChain({ chainId }) {
      const provider = await this.getProvider()
      const chain = config.chains.find(c => c.id === chainId) || config.chains[0]

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toHex(chainId) }]
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

export class SequenceWaasProvider implements EIP1193Provider {
  private rpcUrl: string
  private emitter = new SimpleEmitter()
  requestConfirmationHandler: WaasRequestConfirmationHandler | undefined
  feeConfirmationHandler: WaasFeeOptionConfirmationHandler | undefined
  currentNetwork: number

  constructor(
    public sequenceWaas: SequenceWaaS,
    public showConfirmation: boolean,
    public nodesUrl: string
  ) {
    const initialChain = sequenceWaas.config.network
    const initialChainName = allNetworks.find(n => n.chainId === initialChain || n.name === initialChain)?.name
    this.rpcUrl = this.buildRpcUrl(initialChainName ?? initialChain)
    this.currentNetwork = Number(sequenceWaas.config.network)
  }

  async request({ method, params }: { method: string; params?: any[] }) {
    if (method === 'wallet_switchEthereumChain') {
      const chainId = normalizeChainId(params?.[0].chainId)

      const networkName = allNetworks.find(n => n.chainId === chainId)?.name
      this.rpcUrl = this.buildRpcUrl(networkName ?? chainId)
      this.currentNetwork = Number(chainId)

      return null
    }

    if (method === 'eth_chainId') {
      return toHex(this.currentNetwork)
    }

    if (method === 'eth_accounts') {
      const address = await this.sequenceWaas.getAddress()
      const account = getAddress(address)
      return [account]
    }

    if (method === 'eth_sendTransaction') {
      const txns = params?.[0] as Transaction
      const chainId = this.getChainId()

      let feeOptionsResponse

      try {
        feeOptionsResponse = await this.checkTransactionFeeOptions({ transactions: [txns], chainId })
      } catch (error: unknown) {
        if (isSessionInvalidOrNotFoundError(error)) {
          this.emit('error', error)
          throw new ProviderDisconnectedError(new Error('Provider is not connected'))
        } else {
          const message =
            typeof error === 'object' && error !== null && 'cause' in error
              ? String(error.cause) || 'Failed to check transaction fee options'
              : 'Failed to check transaction fee options'
          throw new InternalRpcError(new Error(message))
        }
      }

      const feeOptions = feeOptionsResponse?.feeOptions
      let selectedFeeOption: FeeOption | undefined

      if (!feeOptionsResponse?.isSponsored && feeOptions && feeOptions.length > 0) {
        if (!this.feeConfirmationHandler) {
          throw new TransactionRejectedRpcError(
            new Error('Unable to send transaction: please use useWaasFeeOptions hook and pick a fee option')
          )
        }

        const id = uuidv4()
        const confirmation = await this.feeConfirmationHandler.confirmFeeOption(id, feeOptions, [txns], chainId)

        if (!confirmation.confirmed) {
          throw new UserRejectedRequestError(new Error('User rejected send transaction request'))
        }

        if (id !== confirmation.id) {
          throw new UserRejectedRequestError(new Error('User confirmation ids do not match'))
        }

        selectedFeeOption = feeOptions.find(feeOption => {
          if (confirmation.feeTokenAddress === zeroAddress && feeOption.token.contractAddress === null) {
            return true
          }
          return feeOption.token.contractAddress === confirmation.feeTokenAddress
        })
      }

      if (this.requestConfirmationHandler && this.showConfirmation) {
        const id = uuidv4()
        const confirmation = await this.requestConfirmationHandler.confirmSignTransactionRequest(id, [txns], chainId)

        if (!confirmation.confirmed) {
          throw new UserRejectedRequestError(new Error('User rejected send transaction request'))
        }

        if (id !== confirmation.id) {
          throw new UserRejectedRequestError(new Error('User confirmation ids do not match'))
        }
      }

      let response

      try {
        response = await this.sequenceWaas.sendTransaction({
          transactions: [txns],
          network: chainId,
          transactionsFeeOption: selectedFeeOption,
          transactionsFeeQuote: feeOptionsResponse?.feeQuote
        })
      } catch (error) {
        if (isSessionInvalidOrNotFoundError(error)) {
          this.emit('error', error)
          throw new ProviderDisconnectedError(new Error('Provider is not connected'))
        } else {
          const message =
            typeof error === 'object' && error !== null && 'cause' in error
              ? String(error.cause) || 'Failed to send transaction'
              : 'Failed to send transaction'
          throw new InternalRpcError(new Error(message))
        }
      }

      if (response.code === 'transactionFailed') {
        throw new TransactionRejectedRpcError(new Error(`Unable to send transaction: ${response.data.error}`))
      }

      if (response.code === 'transactionReceipt') {
        const { txHash } = response.data
        return txHash
      }
    }

    if (method === 'eth_sign' || method === 'personal_sign') {
      if (this.requestConfirmationHandler && this.showConfirmation) {
        const id = uuidv4()
        const confirmation = await this.requestConfirmationHandler.confirmSignMessageRequest(
          id,
          params?.[0],
          Number(this.currentNetwork)
        )

        if (!confirmation.confirmed) {
          throw new UserRejectedRequestError(new Error('User rejected sign message request'))
        }

        if (id !== confirmation.id) {
          throw new UserRejectedRequestError(new Error('User confirmation ids do not match'))
        }
      }

      let sig

      try {
        sig = await this.sequenceWaas.signMessage({ message: params?.[0], network: Number(this.currentNetwork) })
      } catch (error) {
        if (isSessionInvalidOrNotFoundError(error)) {
          this.emit('error', error)
          throw new ProviderDisconnectedError(new Error('Provider is not connected'))
        } else {
          const message =
            typeof error === 'object' && error !== null && 'cause' in error
              ? String(error.cause) || 'Failed to sign message'
              : 'Failed to sign message'
          throw new InternalRpcError(new Error(message))
        }
      }

      return sig.data.signature
    }

    if (method === 'eth_signTypedData' || method === 'eth_signTypedData_v4') {
      if (this.requestConfirmationHandler && this.showConfirmation) {
        const id = uuidv4()
        const confirmation = await this.requestConfirmationHandler.confirmSignMessageRequest(
          id,
          JSON.stringify(JSON.parse(params?.[1]), null, 2),
          Number(this.currentNetwork)
        )

        if (!confirmation.confirmed) {
          throw new UserRejectedRequestError(new Error('User rejected sign typed data request'))
        }

        if (id !== confirmation.id) {
          throw new UserRejectedRequestError(new Error('User confirmation ids do not match'))
        }
      }

      let sig

      try {
        sig = await this.sequenceWaas.signTypedData({
          typedData: JSON.parse(params?.[1]),
          network: Number(this.currentNetwork)
        })
      } catch (error) {
        if (isSessionInvalidOrNotFoundError(error)) {
          this.emit('error', error)
          throw new ProviderDisconnectedError(new Error('Provider is not connected'))
        } else {
          const message =
            typeof error === 'object' && error !== null && 'cause' in error
              ? String(error.cause) || 'Failed to sign typed data'
              : 'Failed to sign typed data'
          throw new InternalRpcError(new Error(message))
        }
      }

      return sig.data.signature
    }

    return await this.rpcRequest(method, params ?? [])
  }

  async getTransaction(txHash: string) {
    return await this.rpcRequest('eth_getTransactionByHash', [txHash])
  }

  detectNetwork(): Promise<{ chainId: number }> {
    return Promise.resolve({ chainId: this.currentNetwork })
  }

  getChainId() {
    return Number(this.currentNetwork)
  }

  async checkTransactionFeeOptions({
    transactions,
    chainId
  }: {
    transactions: Transaction[]
    chainId: number
  }): Promise<{ feeQuote: string | undefined; feeOptions: FeeOption[] | undefined; isSponsored: boolean }> {
    const resp = await this.sequenceWaas.feeOptions({
      transactions: transactions,
      network: chainId
    })

    if (resp.data.feeQuote && resp.data.feeOptions) {
      return { feeQuote: resp.data.feeQuote, feeOptions: resp.data.feeOptions, isSponsored: false }
    }
    return { feeQuote: resp.data.feeQuote, feeOptions: resp.data.feeOptions, isSponsored: true }
  }

  private buildRpcUrl(networkName: string | number) {
    return `${this.nodesUrl}/${networkName}/${this.sequenceWaas.config.projectAccessKey}`
  }

  private async rpcRequest(method: string, params: any[] = []) {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params })
    })

    const json = await response.json()
    if (json.error) {
      throw new Error(json.error?.message || 'RPC request failed')
    }
    return json.result
  }

  on(event: string, listener: (...args: any[]) => void) {
    this.emitter.on(event, listener)
    return this
  }

  removeListener(event: string, listener: (...args: any[]) => void) {
    this.emitter.removeListener(event, listener)
    return this
  }

  emit(event: string, ...args: any[]) {
    this.emitter.emit(event, ...args)
  }
}

class SimpleEmitter {
  private listeners = new Map<string, Set<(...args: any[]) => void>>()

  on(event: string, listener: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  removeListener(event: string, listener: (...args: any[]) => void) {
    this.listeners.get(event)?.delete(listener)
  }

  emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach(listener => listener(...args))
  }
}

export interface WaasRequestConfirmationHandler {
  confirmSignTransactionRequest(id: string, txs: Transaction[], chainId: number): Promise<{ id: string; confirmed: boolean }>
  confirmSignMessageRequest(id: string, message: string, chainId: number): Promise<{ id: string; confirmed: boolean }>
}

export interface WaasFeeOptionConfirmationHandler {
  confirmFeeOption(
    id: string,
    options: FeeOption[],
    txs: Transaction[],
    chainId: number
  ): Promise<{ id: string; feeTokenAddress?: string | null; confirmed: boolean }>
}

const DEVICE_EMOJIS = [
  ...'🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐽🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🐛🦋🐌🐞🐜🦟🦗🕷🕸🦂🐢🐍🦎🦖🦕🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🐊🐅🐆🦓🦍🦧🐘🦛🦏🐪🐫🦒🦘🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐈🐓🦃🦚🦜🦢🦩🕊🐇🦝🦨🦡🦦🦥🐁🐀🐿🦔🐾🐉🐲🌵🎄🌲🌳🌴🌱🌿🍀🎍🎋🍃👣🍂🍁🍄🐚🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌝🍏🍎🍐🍊🍋🍌🍉🍇🍓🍈🥭🍍🥥🥝🍅🥑🥦🥬🥒🌶🌽🥕🧄🧅🥔🍠🥐🥯🍞🥖🥨🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🦴🌭🍔🍟🍕🥪🥙🧆🌮🌯🥗🥘🥫🍝🍜🍲🍛🍣🍱🥟🦪🍤🍙🍚🍘🍥🥠🥮🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜👀👂👃👄👅👆👇👈👉👊👋👌👍👎👏👐👑👒👓🎯🎰🎱🎲🎳👾👯👺👻👽🏂🏃🏄'
]

export function randomName() {
  const randomEmoji = DEVICE_EMOJIS[Math.floor(Math.random() * DEVICE_EMOJIS.length)]
  const randomWord1 = WORDS[Math.floor(Math.random() * WORDS.length)]
  const randomWord2 = WORDS[Math.floor(Math.random() * WORDS.length)]

  return `${randomEmoji} ${randomWord1} ${randomWord2}`
}

const WORDS = [
  'alpha',
  'bravo',
  'charlie',
  'delta',
  'echo',
  'foxtrot',
  'golf',
  'hotel',
  'india',
  'juliet',
  'kilo',
  'lima',
  'mike',
  'november',
  'oscar',
  'papa',
  'quebec',
  'romeo',
  'sierra',
  'tango',
  'uniform',
  'victor',
  'whiskey',
  'xray',
  'yankee',
  'zulu',
  'falcon',
  'eagle',
  'hawk',
  'sparrow',
  'raven',
  'lynx',
  'tiger',
  'leopard',
  'panther',
  'wolf',
  'fox',
  'otter',
  'beaver',
  'bear',
  'bison',
  'coyote',
  'badger',
  'cougar',
  'jaguar',
  'orca',
  'narwhal',
  'dolphin',
  'whale',
  'shark',
  'salmon',
  'trout',
  'pike',
  'perch',
  'heron',
  'stork',
  'crane',
  'pelican',
  'gannet',
  'swan',
  'goose',
  'duck',
  'owl',
  'vulture',
  'condor',
  'ibis',
  'lark',
  'robin',
  'finch',
  'wren',
  'sparrowhawk',
  'buzzard',
  'harrier',
  'kite',
  'osprey',
  'falconer',
  'gyrfalcon',
  'merlin',
  'kestrel'
]

function isSessionInvalidOrNotFoundError(error: unknown) {
  return error instanceof WebrpcEndpointError && error.cause === 'session invalid or not found'
}
