import { sequence } from '0xsequence'
import { LocalStorageKey } from '@0xsequence/kit'
import { SequenceWaaS, SequenceConfig, ExtendedSequenceConfig, Transaction, FeeOption } from '@0xsequence/waas'
import { ethers } from 'ethers'
import { v4 as uuidv4 } from 'uuid'
import { TransactionRejectedRpcError, UserRejectedRequestError, getAddress } from 'viem'
import { createConnector } from 'wagmi'

export interface SequenceWaasConnectConfig {
  googleClientId?: string
  appleClientId?: string
  appleRedirectURI?: string
  enableConfirmationModal?: boolean
  loginType: 'email' | 'google' | 'apple'
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
    [LocalStorageKey.WaasSessionHash]: string
    [LocalStorageKey.WaasActiveLoginType]: string
    [LocalStorageKey.WaasGoogleIdToken]: string
    [LocalStorageKey.WaasEmailIdToken]: string
    [LocalStorageKey.WaasAppleIdToken]: string
    [LocalStorageKey.WaasGoogleClientID]: string
    [LocalStorageKey.WaasAppleClientID]: string
    [LocalStorageKey.WaasAppleRedirectURI]: string
  }

  const showConfirmationModal = params.enableConfirmationModal ?? false

  const initialChain = params.network ?? 137
  const initialChainName = sequence.network.allNetworks.find(n => n.chainId === initialChain || n.name === initialChain)?.name

  const initialJsonRpcProvider = new ethers.providers.JsonRpcProvider(
    `https://nodes.sequence.app/${initialChainName ?? 'polygon'}/${params.projectAccessKey}`
  )

  const sequenceWaas = new SequenceWaaS({
    network: initialChain,
    projectAccessKey: params.projectAccessKey,
    waasConfigKey: params.waasConfigKey
  })

  const sequenceWaasProvider = new SequenceWaasProvider(sequenceWaas, initialJsonRpcProvider, initialChain, showConfirmationModal)

  const updateNetwork = async (chainId: number) => {
    const networkName = sequence.network.allNetworks.find(n => n.chainId === chainId || n.name === initialChain)?.name

    const jsonRpcProvider = new ethers.providers.JsonRpcProvider(
      `https://nodes.sequence.app/${networkName}/${params.projectAccessKey}`
    )
    sequenceWaasProvider.updateJsonRpcProvider(jsonRpcProvider)
    sequenceWaasProvider.updateNetwork(ethers.providers.getNetwork(chainId))
  }

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

      const isConnected = await provider.sequenceWaas.isSignedIn()
      if (!isConnected) {
        const sessionHash = await provider.sequenceWaas.getSessionHash()
        await config.storage?.setItem(LocalStorageKey.WaasSessionHash, sessionHash)
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

        if (idToken) {
          try {
            await provider.sequenceWaas.signIn({ idToken }, randomName())
          } catch (e) {
            console.log(e)
            await this.disconnect()
          }

          const accounts = await this.getAccounts()

          if (accounts.length) {
            await config.storage?.setItem(LocalStorageKey.WaasActiveLoginType, params.loginType)
          }
        }

        await config.storage?.removeItem(LocalStorageKey.WaasGoogleIdToken)
        await config.storage?.removeItem(LocalStorageKey.WaasEmailIdToken)
        await config.storage?.removeItem(LocalStorageKey.WaasAppleIdToken)
      }

      return {
        accounts: await this.getAccounts(),
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

      await config.storage?.removeItem(LocalStorageKey.WaasSessionHash)
      await config.storage?.removeItem(LocalStorageKey.WaasActiveLoginType)

      const sessionHash = await provider.sequenceWaas.getSessionHash()
      await config.storage?.setItem(LocalStorageKey.WaasSessionHash, sessionHash)
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
      const chain = config.chains.find(c => c.id === chainId) || config.chains[0]

      updateNetwork(chainId)

      config.emitter.emit('change', { chainId })

      return chain
    },

    async getChainId() {
      const provider = await this.getProvider()
      return provider.getChainId()
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

export class SequenceWaasProvider extends ethers.providers.BaseProvider implements sequence.provider.EIP1193Provider {
  constructor(
    public sequenceWaas: SequenceWaaS,
    public jsonRpcProvider: ethers.providers.JsonRpcProvider,
    network: ethers.providers.Networkish,
    public showConfirmation: boolean
  ) {
    super(network)
  }

  requestConfirmationHandler: WaasRequestConfirmationHandler | undefined
  feeConfirmationHandler: WaasFeeOptionConfirmationHandler | undefined

  currentNetwork: ethers.providers.Network = this.network

  updateJsonRpcProvider(jsonRpcProvider: ethers.providers.JsonRpcProvider) {
    this.jsonRpcProvider = jsonRpcProvider
  }

  updateNetwork(network: ethers.providers.Network) {
    this.currentNetwork = network
  }

  async request({ method, params }: { method: string; params?: any[] }) {
    if (method === 'eth_accounts') {
      const address = await this.sequenceWaas.getAddress()
      const account = getAddress(address)
      return [account]
    }

    if (method === 'eth_sendTransaction') {
      const txns: ethers.Transaction[] = await ethers.utils.resolveProperties(params?.[0])

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
        transactions: [await ethers.utils.resolveProperties(params?.[0])],
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
        return this.getTransaction(txHash)
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
          this.currentNetwork.chainId
        )

        if (!confirmation.confirmed) {
          throw new UserRejectedRequestError(new Error('User rejected sign message request'))
        }

        if (id !== confirmation.id) {
          throw new UserRejectedRequestError(new Error('User confirmation ids do not match'))
        }
      }
      const sig = await this.sequenceWaas.signMessage({ message: params?.[0], network: this.currentNetwork.chainId })

      return sig.data.signature
    }

    return undefined
  }

  async getTransaction(txHash: string) {
    return await this.jsonRpcProvider.getTransaction(txHash)
  }

  detectNetwork(): Promise<ethers.providers.Network> {
    return Promise.resolve(this.currentNetwork)
  }

  getChainId() {
    return this.currentNetwork.chainId
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
