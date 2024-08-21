import { allNetworks, EIP1193Provider } from '@0xsequence/network'
import { SequenceWaaS, SequenceConfig, ExtendedSequenceConfig, Transaction, FeeOption } from '@0xsequence/waas'
import { ethers } from 'ethers'
import { v4 as uuidv4 } from 'uuid'
import { TransactionRejectedRpcError, UserRejectedRequestError, getAddress } from 'viem'
import { createConnector } from 'wagmi'

import { LocalStorageKey } from '../../constants/localStorage'

export interface SequenceWaasConnectConfig {
  googleClientId?: string
  appleClientId?: string
  appleRedirectURI?: string
  enableConfirmationModal?: boolean
  loginType: 'email' | 'google' | 'apple'
  isDev?: boolean
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
    [LocalStorageKey.WaasGoogleClientID]: string
    [LocalStorageKey.WaasAppleClientID]: string
    [LocalStorageKey.WaasAppleRedirectURI]: string
    [LocalStorageKey.WaasSignInEmail]: string
  }

  const isDev = !!params?.isDev
  const nodesUrl = isDev ? 'https://dev-nodes.sequence.app' : 'https://nodes.sequence.app'

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
        // (for SSR) only run in browser client
        return
      }

      const provider = await this.getProvider()

      if (params.googleClientId) {
        await config.storage?.setItem(LocalStorageKey.WaasGoogleClientID, params.googleClientId)
      }
      if (params.appleClientId) {
        await config.storage?.setItem(LocalStorageKey.WaasAppleClientID, params.appleClientId)
      }
      if (params.appleRedirectURI) {
        await config.storage?.setItem(LocalStorageKey.WaasAppleRedirectURI, params.appleRedirectURI)
      }

      provider.on('disconnect', () => {
        this.onDisconnect()
      })
    },

    async connect(_connectInfo) {
      const provider = await this.getProvider()
      const isSignedIn = await provider.sequenceWaas.isSignedIn()

      if (!isSignedIn) {
        const googleIdToken = await config.storage?.getItem(LocalStorageKey.WaasGoogleIdToken)
        const emailIdToken = await config.storage?.getItem(LocalStorageKey.WaasEmailIdToken)
        const appleIdToken = await config.storage?.getItem(LocalStorageKey.WaasAppleIdToken)

        let idToken: string | undefined

        if (params.loginType === 'google' && googleIdToken) {
          idToken = googleIdToken
        } else if (params.loginType === 'email' && emailIdToken) {
          idToken = emailIdToken
        } else if (params.loginType === 'apple' && appleIdToken) {
          idToken = appleIdToken
        }

        await config.storage?.removeItem(LocalStorageKey.WaasGoogleIdToken)
        await config.storage?.removeItem(LocalStorageKey.WaasEmailIdToken)
        await config.storage?.removeItem(LocalStorageKey.WaasAppleIdToken)

        if (idToken) {
          try {
            const signInResponse = await provider.sequenceWaas.signIn({ idToken }, randomName())
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

      if (accounts.length) {
        await config.storage?.setItem(LocalStorageKey.WaasActiveLoginType, params.loginType)
      } else {
        throw new Error('No accounts found')
      }

      return {
        accounts,
        chainId: await this.getChainId()
      }
    },

    async disconnect() {
      const provider = await this.getProvider()

      try {
        await provider.sequenceWaas.dropSession({ sessionId: await provider.sequenceWaas.getSessionId() })
      } catch (e) {
        console.log(e)
      }

      await config.storage?.removeItem(LocalStorageKey.WaasActiveLoginType)
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
      // const provider = await this.getProvider()

      config.emitter.emit('change', { chainId: normalizeChainId(chain) })

      // provider.setDefaultChainId(normalizeChainId(chain))
    },

    async onConnect(_connectInfo) {},

    async onDisconnect() {
      await this.disconnect()
    }
  }))
}

export class SequenceWaasProvider extends ethers.AbstractProvider implements EIP1193Provider {
  jsonRpcProvider: ethers.JsonRpcProvider
  requestConfirmationHandler: WaasRequestConfirmationHandler | undefined
  feeConfirmationHandler: WaasFeeOptionConfirmationHandler | undefined
  currentNetwork: ethers.Network

  constructor(
    public sequenceWaas: SequenceWaaS,
    public showConfirmation: boolean,
    public nodesUrl: string
  ) {
    super(sequenceWaas.config.network)

    const initialChain = sequenceWaas.config.network
    const initialChainName = allNetworks.find(n => n.chainId === initialChain || n.name === initialChain)?.name
    const initialJsonRpcProvider = new ethers.JsonRpcProvider(
      `${nodesUrl}/${initialChainName}/${sequenceWaas.config.projectAccessKey}`
    )

    this.jsonRpcProvider = initialJsonRpcProvider
    this.currentNetwork = ethers.Network.from(sequenceWaas.config.network)
  }

  async request({ method, params }: { method: string; params?: any[] }) {
    if (method === 'wallet_switchEthereumChain') {
      const chainId = normalizeChainId(params?.[0].chainId)

      const networkName = allNetworks.find(n => n.chainId === chainId)?.name
      const jsonRpcProvider = new ethers.JsonRpcProvider(
        `${this.nodesUrl}/${networkName}/${this.sequenceWaas.config.projectAccessKey}`
      )

      this.jsonRpcProvider = jsonRpcProvider
      this.currentNetwork = ethers.Network.from(chainId)

      return null
    }

    if (method === 'eth_chainId') {
      return ethers.toQuantity(this.currentNetwork.chainId)
    }

    if (method === 'eth_accounts') {
      const address = await this.sequenceWaas.getAddress()
      const account = getAddress(address)
      return [account]
    }

    if (method === 'eth_sendTransaction') {
      const txns: ethers.Transaction[] = await ethers.resolveProperties(params?.[0])

      const chainId = this.getChainId()

      const feeOptionsResponse = await this.checkTransactionFeeOptions({ transactions: [txns] as Transaction[], chainId })
      const feeOptions = feeOptionsResponse?.feeOptions
      let selectedFeeOption: FeeOption | undefined

      if (!feeOptionsResponse?.isSponsored && feeOptions && feeOptions.length > 0) {
        if (!this.feeConfirmationHandler) {
          throw new TransactionRejectedRpcError(
            new Error('Unable to send transaction: please use UseWaasFeeOptions hook and pick a fee option')
          )
        }

        const id = uuidv4()
        const confirmation = await this.feeConfirmationHandler.confirmFeeOption(id, feeOptions, txns, chainId)

        if (!confirmation.confirmed) {
          throw new UserRejectedRequestError(new Error('User rejected send transaction request'))
        }

        if (id !== confirmation.id) {
          throw new UserRejectedRequestError(new Error('User confirmation ids do not match'))
        }

        selectedFeeOption = feeOptions.find(feeOption => feeOption.token.contractAddress === confirmation.feeTokenAddress)
      }

      if (this.requestConfirmationHandler && this.showConfirmation) {
        const id = uuidv4()
        const confirmation = await this.requestConfirmationHandler.confirmSignTransactionRequest(id, txns, chainId)

        if (!confirmation.confirmed) {
          throw new UserRejectedRequestError(new Error('User rejected send transaction request'))
        }

        if (id !== confirmation.id) {
          throw new UserRejectedRequestError(new Error('User confirmation ids do not match'))
        }
      }

      const response = await this.sequenceWaas.sendTransaction({
        transactions: [await ethers.resolveProperties(params?.[0])],
        network: chainId,
        transactionsFeeOption: selectedFeeOption,
        transactionsFeeQuote: feeOptionsResponse?.feeQuote
      })

      console.log('response', response)

      if (response.code === 'transactionFailed') {
        // Failed
        throw new TransactionRejectedRpcError(new Error(`Unable to send transaction: ${response.data.error}`))
      }

      if (response.code === 'transactionReceipt') {
        // Success
        const { txHash } = response.data
        return txHash
      }
    }

    if (
      method === 'eth_sign' ||
      method === 'eth_signTypedData' ||
      method === 'eth_signTypedData_v4' ||
      method === 'personal_sign'
    ) {
      if (this.requestConfirmationHandler && this.showConfirmation) {
        const id = uuidv4()
        const confirmation = await this.requestConfirmationHandler.confirmSignMessageRequest(
          id,
          params?.[0],
          Number(this.currentNetwork.chainId)
        )

        if (!confirmation.confirmed) {
          throw new UserRejectedRequestError(new Error('User rejected sign message request'))
        }

        if (id !== confirmation.id) {
          throw new UserRejectedRequestError(new Error('User confirmation ids do not match'))
        }
      }
      const sig = await this.sequenceWaas.signMessage({ message: params?.[0], network: Number(this.currentNetwork.chainId) })

      return sig.data.signature
    }

    return await this.jsonRpcProvider.send(method, params ?? [])
  }

  async getTransaction(txHash: string) {
    return await this.jsonRpcProvider.getTransaction(txHash)
  }

  detectNetwork(): Promise<ethers.Network> {
    return Promise.resolve(this.currentNetwork)
  }

  getChainId() {
    return Number(this.currentNetwork.chainId)
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
}

export interface WaasRequestConfirmationHandler {
  confirmSignTransactionRequest(
    id: string,
    txs: ethers.Transaction[],
    chainId: number
  ): Promise<{ id: string; confirmed: boolean }>
  confirmSignMessageRequest(id: string, message: string, chainId: number): Promise<{ id: string; confirmed: boolean }>
}

export interface WaasFeeOptionConfirmationHandler {
  confirmFeeOption(
    id: string,
    options: FeeOption[],
    txs: ethers.Transaction[],
    chainId: number
  ): Promise<{ id: string; feeTokenAddress?: string | null; confirmed: boolean }>
}

const DEVICE_EMOJIS = [
  // 256 emojis for unsigned byte range 0 - 255
  ...'🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐽🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🐛🦋🐌🐞🐜🦟🦗🕷🕸🦂🐢🐍🦎🦖🦕🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🐊🐅🐆🦓🦍🦧🐘🦛🦏🐪🐫🦒🦘🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐈🐓🦃🦚🦜🦢🦩🕊🐇🦝🦨🦡🦦🦥🐁🐀🐿🦔🐾🐉🐲🌵🎄🌲🌳🌴🌱🌿🍀🎍🎋🍃👣🍂🍁🍄🐚🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌝🍏🍎🍐🍊🍋🍌🍉🍇🍓🍈🥭🍍🥥🥝🍅🥑🥦🥬🥒🌶🌽🥕🧄🧅🥔🍠🥐🥯🍞🥖🥨🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🦴🌭🍔🍟🍕🥪🥙🧆🌮🌯🥗🥘🥫🍝🍜🍲🍛🍣🍱🥟🦪🍤🍙🍚🍘🍥🥠🥮🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜👀👂👃👄👅👆👇👈👉👊👋👌👍👎👏👐👑👒👓🎯🎰🎱🎲🎳👾👯👺👻👽🏂🏃🏄'
]

// Generate a random name for the session, using a single random emoji and 2 random words
// from the list of words of ethers
export function randomName() {
  const wordlistSize = 2048
  const words = ethers.wordlists.en

  const randomEmoji = DEVICE_EMOJIS[Math.floor(Math.random() * DEVICE_EMOJIS.length)]
  const randomWord1 = words.getWord(Math.floor(Math.random() * wordlistSize))
  const randomWord2 = words.getWord(Math.floor(Math.random() * wordlistSize))

  return `${randomEmoji} ${randomWord1} ${randomWord2}`
}

function normalizeChainId(chainId: string | number | bigint | { chainId: string }) {
  if (typeof chainId === 'object') return normalizeChainId(chainId.chainId)
  if (typeof chainId === 'string') return Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10)
  if (typeof chainId === 'bigint') return Number(chainId)
  return chainId
}
