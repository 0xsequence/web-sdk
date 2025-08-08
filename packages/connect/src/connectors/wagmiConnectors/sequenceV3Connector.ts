import { DappClient } from '@0xsequence/dapp-client'
import { Relayer, Signers } from '@0xsequence/wallet-core'
import { v4 as uuidv4 } from 'uuid'
import {
  getAddress,
  RpcError,
  type EIP1193EventMap,
  type EIP1193Provider,
  type EIP1193RequestFn,
  type TransactionRequest,
  type TypedData
} from 'viem'
import { createConnector, type Connector } from 'wagmi'

// Helper types
type EIP1193RequestArgs = Parameters<EIP1193RequestFn>[0]

export interface SequenceV3Connector extends Connector {
  type: 'sequence-v3-wallet'
  auxData?: Record<string, unknown>
}

export interface BaseSequenceV3ConnectorOptions {
  projectAccessKey: string
  walletUrl: string
  dappOrigin: string
  defaultNetwork: number
  permissions?: Signers.Session.ExplicitParams
  nodesUrl?: string
  loginType: 'email' | 'google' | 'apple' | 'passkey'
}

export interface FeeOptionConfirmationHandler {
  confirmFeeOption(
    id: string,
    options: Relayer.FeeOption[],
    txs: TransactionRequest[],
    chainId: number
  ): Promise<{ id: string; feeOption?: Relayer.FeeOption; confirmed: boolean }>
}

export function sequenceV3Wallet(params: BaseSequenceV3ConnectorOptions) {
  type Provider = SequenceV3Provider
  type Properties = {
    client: DappClient
    auxData?: Record<string, unknown>
  }
  type StorageItem = {}

  const client = new DappClient(params.walletUrl, params.dappOrigin)
  const provider = new SequenceV3Provider(client, params.defaultNetwork, params.nodesUrl, params.loginType, params.permissions)

  return createConnector<Provider, Properties, StorageItem>(config => {
    client.on('sessionsUpdated', () => {
      const walletAddress = client.getWalletAddress()
      if (client.isInitialized && walletAddress) {
        config.emitter.emit('change', {
          accounts: [getAddress(walletAddress)],
          chainId: provider.getChainId()
        })
      } else {
        config.emitter.emit('disconnect')
      }
    })

    return {
      id: `sequence-v3-wallet`,
      name: 'Sequence V3 Wallet',
      type: sequenceV3Wallet.type,
      provider,

      get client() {
        return client
      },

      auxData: undefined as Record<string, unknown> | undefined,

      async setup() {
        if (typeof window !== 'object') {
          return
        }
      },

      async connect() {
        const accounts = await provider.request({ method: 'eth_requestAccounts' })
        const chainId = await this.getChainId()
        return { accounts, chainId }
      },

      async disconnect() {
        await client.disconnect()
      },

      async getAccounts() {
        await client.initialize()
        const address = client.getWalletAddress()
        return address ? [getAddress(address)] : []
      },

      async getProvider() {
        return provider
      },

      async isAuthorized() {
        try {
          await client.initialize()
          return client.getWalletAddress() ? true : false
        } catch (e) {
          console.error('Error during authorization check:', e)
          return false
        }
      },

      async switchChain({ chainId }) {
        const chain = config.chains.find(c => c.id === chainId) || config.chains[0]

        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }]
        })

        config.emitter.emit('change', { chainId })

        return chain
      },

      async getChainId() {
        return provider.getChainId()
      },

      onAccountsChanged(accounts: string[]) {
        if (accounts.length === 0) {
          this.disconnect()
        } else {
          config.emitter.emit('change', { accounts: accounts.map(acc => getAddress(acc)) })
        }
      },

      onChainChanged(chainId) {
        config.emitter.emit('change', { chainId: Number(chainId) })
      },

      async onDisconnect() {
        // The 'sessionsUpdated' listener will handle the disconnect event
      }
    }
  })
}

sequenceV3Wallet.type = 'sequence-v3-wallet' as const

export class SequenceV3Provider implements EIP1193Provider {
  private currentChainId: number
  private nodesUrl: string
  private loginType: 'email' | 'google' | 'apple' | 'passkey'
  private initialPermissions?: Signers.Session.ExplicitParams

  public feeConfirmationHandler?: FeeOptionConfirmationHandler

  private readonly listeners = new Map<keyof EIP1193EventMap, Array<(...args: any[]) => void>>()

  constructor(
    private client: DappClient,
    defaultNetwork: number,
    nodesUrl = 'https://nodes.sequence.app',
    loginType: 'email' | 'google' | 'apple' | 'passkey' = 'google',
    initialPermissions?: Signers.Session.ExplicitParams
  ) {
    this.currentChainId = defaultNetwork
    this.nodesUrl = nodesUrl
    this.loginType = loginType
    this.initialPermissions = initialPermissions
  }

  on<TEvent extends keyof EIP1193EventMap>(event: TEvent, listener: EIP1193EventMap[TEvent]): void {
    const eventListeners = this.listeners.get(event) || []
    eventListeners.push(listener)
    this.listeners.set(event, eventListeners)
  }

  removeListener<TEvent extends keyof EIP1193EventMap>(event: TEvent, listener: EIP1193EventMap[TEvent]): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const filteredListeners = eventListeners.filter(l => l !== listener)
      this.listeners.set(event, filteredListeners)
    }
  }

  private emit<TEvent extends keyof EIP1193EventMap>(event: TEvent, ...args: Parameters<EIP1193EventMap[TEvent]>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => {
        listener(...args)
      })
    }
  }

  getChainId(): number {
    return this.currentChainId
  }

  async request(args: EIP1193RequestArgs): Promise<any> {
    const { method, params } = args

    console.log(`Request method: ${method}`, params)

    switch (method) {
      case 'eth_accounts': {
        if (this.client.isInitialized) {
          const address = this.client.getWalletAddress()
          return address ? [getAddress(address)] : []
        }
        return []
      }

      case 'eth_requestAccounts': {
        if (this.client.isInitialized) {
          const address = this.client.getWalletAddress()
          return address ? [getAddress(address)] : []
        }
        await this.client.connect(this.currentChainId, this.initialPermissions, {
          preferredLoginMethod: this.loginType
        })
        const walletAddress = this.client.getWalletAddress()
        if (!walletAddress) {
          throw new RpcError(new Error('User rejected the request.'), { code: 4001, shortMessage: 'User rejected the request.' })
        }
        return [getAddress(walletAddress)]
      }

      case 'eth_chainId': {
        return `0x${this.currentChainId.toString(16)}`
      }

      case 'eth_sign':
      case 'personal_sign': {
        if (!params || !Array.isArray(params) || params.length < 2) {
          throw new RpcError(new Error('Invalid params for personal_sign'), {
            code: -32602,
            shortMessage: 'Invalid params for personal_sign'
          })
        }
        const message = params[0] as string

        return new Promise((resolve, reject) => {
          const unsubscribe = this.client.on('signatureResponse', (data: any) => {
            if (data.error) {
              reject(new RpcError(new Error(data.error), { code: 4001, shortMessage: data.error }))
            } else {
              resolve(data.response.signature)
            }
            unsubscribe()
          })
          this.client.signMessage(this.currentChainId, message).catch(reject)
        })
      }

      case 'eth_signTypedData_v4':
      case 'eth_signTypedData': {
        if (!params || !Array.isArray(params) || params.length < 2) {
          throw new RpcError(new Error('Invalid params for eth_signTypedData'), {
            code: -32602,
            shortMessage: 'Invalid params for eth_signTypedData'
          })
        }
        const [address, typedData] = params as [string, string | object]

        if (!address || !typedData) {
          throw new RpcError(new Error('Invalid params for eth_signTypedData'), {
            code: -32602,
            shortMessage: 'Invalid params for eth_signTypedData'
          })
        }

        let parsedTypedData: object

        if (typeof typedData === 'string') {
          try {
            parsedTypedData = JSON.parse(typedData)
          } catch (error) {
            throw new RpcError(new Error('Invalid JSON format for typedData'), {
              code: -32602,
              shortMessage: 'Invalid JSON format for typedData'
            })
          }
        } else if (typeof typedData === 'object' && typedData !== null) {
          parsedTypedData = typedData
        } else {
          throw new RpcError(new Error('Invalid type for typedData'), {
            code: -32602,
            shortMessage: 'Invalid type for typedData'
          })
        }

        return new Promise((resolve, reject) => {
          const unsubscribe = this.client.on('signatureResponse', (data: any) => {
            if (data.error) {
              reject(new RpcError(new Error(data.error), { code: 4001, shortMessage: data.error }))
            } else {
              resolve(data.response.signature)
            }
            unsubscribe()
          })

          this.client.signTypedData(this.currentChainId, parsedTypedData as TypedData).catch(reject)
        })
      }

      case 'eth_sendTransaction': {
        if (!params || !Array.isArray(params) || !params[0]) {
          throw new RpcError(new Error('Invalid params for eth_sendTransaction'), {
            code: -32602,
            shortMessage: 'Invalid params for eth_sendTransaction'
          })
        }
        const tx = params[0] as TransactionRequest
        const transactions = [{ to: tx.to!, value: tx.value ?? 0n, data: tx.data ?? '0x' }]

        const feeOptions = await this.client.getFeeOptions(this.currentChainId, transactions)
        let selectedFeeOption: Relayer.FeeOption | undefined

        if (feeOptions && feeOptions.length > 0) {
          if (!this.feeConfirmationHandler) {
            throw new RpcError(new Error('Unable to send transaction: please use useFeeOptions hook and pick a fee option'), {
              code: -32000,
              shortMessage: 'Fee confirmation handler not found'
            })
          }

          const id = uuidv4()
          const confirmation = await this.feeConfirmationHandler.confirmFeeOption(id, feeOptions, [tx], this.currentChainId)

          if (!confirmation.confirmed) {
            throw new RpcError(new Error('User rejected the request.'), {
              code: 4001,
              shortMessage: 'User rejected send transaction request.'
            })
          }

          if (id !== confirmation.id) {
            throw new RpcError(new Error('User confirmation ids do not match'), {
              code: -32000,
              shortMessage: 'Confirmation ID mismatch'
            })
          }

          selectedFeeOption = confirmation.feeOption
        }

        return this.client.sendTransaction(this.currentChainId, transactions, selectedFeeOption)
      }

      case 'wallet_switchEthereumChain': {
        if (!params || !Array.isArray(params) || !params[0] || !(params[0] as any).chainId) {
          throw new RpcError(new Error('Invalid params for wallet_switchEthereumChain'), {
            code: -32602,
            shortMessage: 'Invalid params for wallet_switchEthereumChain'
          })
        }
        const newChainId = Number((params[0] as any).chainId)

        this.currentChainId = newChainId
        this.emit('chainChanged', `0x${newChainId.toString(16)}`)
        return null
      }

      default: {
        console.warn(`Method ${method} not explicitly handled by DappClient, using fallback RPC.`)
        const res = await fetch(`${this.nodesUrl}/${this.currentChainId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
        })
        if (!res.ok) {
          throw new RpcError(new Error('Internal JSON-RPC error.'), { code: -32603, shortMessage: 'Internal JSON-RPC error.' })
        }
        const json = await res.json()
        return json.result
      }
    }
  }
}
