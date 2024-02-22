import { SequenceWaaS, SequenceConfig, ExtendedSequenceConfig, defaults } from '@0xsequence/waas'
import { LocalStorageKey } from '@0xsequence/kit'
import { UserRejectedRequestError, getAddress } from 'viem'
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

  const initialChain = waasConfig.network ?? 137

  const initialJsonRpcProvider = new ethers.providers.JsonRpcProvider(
    `https://next-nodes.sequence.app/polygon/${waasConfig.projectAccessKey}`
  )

  const sequenceWaas = new SequenceWaaS(
    {
      network: initialChain,
      projectAccessKey: waasConfig.projectAccessKey,
      waasConfigKey: waasConfig.waasConfigKey
    },
    defaults.TEST
  )

  let requestHandler: WaasRequestConfirmationHandler

  const sequenceWaasProvider = new SequenceWaasProvider(sequenceWaas, initialJsonRpcProvider, initialChain)

  const updateNetwork = async (chainId: number) => {
    const networks = await sequenceWaas.networkList()
    const networkName = networks.find(n => n.id === chainId)?.name
    const jsonRpcProvider = new ethers.providers.JsonRpcProvider(
      `https://next-nodes.sequence.app/${networkName}/${waasConfig.projectAccessKey}`
    )
    sequenceWaasProvider.updateJsonRpcProvider(jsonRpcProvider)
    sequenceWaasProvider.updateNetwork(ethers.providers.getNetwork(chainId))
  }

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

      sequenceWaasProvider.on('disconnect', () => {
        this.onDisconnect()
      })
    },
    async connect({ chainId, isReconnecting } = {}) {
      const isSignedIn = await sequenceWaas.isSignedIn()

      let accounts: `0x${string}`[] = []
      chainId = sequenceWaasProvider.getChainId()

      if (isSignedIn) {
        try {
          accounts = await this.getAccounts()
        } catch (e) {
          console.log(e)
        }
      } else {
        const idToken = localStorage.getItem(LocalStorageKey.GoogleIDToken)

        if (waasConfig.googleClientId && idToken) {
          try {
            await sequenceWaas.signIn({ idToken }, randomName())
          } catch (e) {
            console.log(e)
          }
          localStorage.removeItem(LocalStorageKey.GoogleIDToken)

          console.log('address', await sequenceWaas.getAddress())

          accounts = await this.getAccounts()
        }
      }

      return {
        accounts,
        chainId
      }
    },
    async disconnect() {
      try {
        await sequenceWaas.dropSession({ sessionId: await sequenceWaas.getSessionId() })
      } catch (e) {
        console.log(e)
      }

      localStorage.removeItem(LocalStorageKey.WaasSessionHash)
    },
    async getAccounts() {
      try {
        const isSignedIn = await sequenceWaas.isSignedIn()
        if (isSignedIn) {
          const address = await sequenceWaas.getAddress()
          return [getAddress(address)]
        }
      } catch (e) {
        return []
      }
      return []
    },
    async getProvider(): Promise<SequenceWaasProvider> {
      return sequenceWaasProvider
    },
    async isAuthorized() {
      try {
        return await sequenceWaas.isSignedIn()
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
      const provider = await this.getProvider()

      config.emitter.emit('change', { chainId: normalizeChainId(chain) })
      provider.setDefaultChainId(normalizeChainId(chain))
    },
    async onConnect(connectinfo) {
      console.log('onConnect connectInfo', connectinfo)
    },
    async onDisconnect() {
      await this.disconnect()
    }
  }))
}

export class SequenceWaasProvider extends ethers.providers.BaseProvider implements EIP1193Provider {
  constructor(
    public sequenceWaas: SequenceWaaS,
    public jsonRpcProvider: ethers.providers.JsonRpcProvider,
    network: ethers.providers.Networkish
  ) {
    super(network)
  }

  requestConfirmationHandler: WaasRequestConfirmationHandler | undefined

  currentNetwork: ethers.providers.Network = this.network

  updateJsonRpcProvider(jsonRpcProvider: ethers.providers.JsonRpcProvider) {
    this.jsonRpcProvider = jsonRpcProvider
  }

  updateNetwork(network: ethers.providers.Network) {
    this.currentNetwork = network
  }

  async request({ method, params }: { method: string; params: any[] }) {
    if (method === 'eth_accounts') {
      const address = await this.sequenceWaas.getAddress()
      const account = getAddress(address)
      return [account]
    }

    if (method === 'eth_sendTransaction') {
      const txns: ethers.Transaction[] = await ethers.utils.resolveProperties(params[0])

      const chainId = this.getChainId()

      if (this.requestConfirmationHandler) {
        const confirmation = await this.requestConfirmationHandler.confirmSignTransactionRequest(txns, chainId)
        // TODO: return rejected
        if (!confirmation) {
          return
        }
      }

      const response = await this.sequenceWaas.sendTransaction({
        transactions: [await ethers.utils.resolveProperties(params[0])],
        network: chainId
      })

      if (response.code === 'transactionFailed') {
        // Failed
        throw new Error(`Unable to send transaction: ${response.data.error}`)
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
      if (this.requestConfirmationHandler) {
        const confirmation = await this.requestConfirmationHandler.confirmSignMessageRequest(
          params[0],
          this.currentNetwork.chainId
        )
        console.log('confirmation', confirmation)
        // TODO: return rejected
        if (!confirmation) {
          console.log('rejected')

          return new UserRejectedRequestError(new Error('User rejected sign message request'))
        }
      }
      const sig = await this.sequenceWaas.signMessage({ message: params[0], network: this.currentNetwork.chainId })

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
}

export interface WaasRequestConfirmationHandler {
  confirmSignTransactionRequest(txs: ethers.Transaction[], chainId: number): Promise<Boolean>
  confirmSignMessageRequest(message: string, chainId: number): Promise<Boolean>
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
