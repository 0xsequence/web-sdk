import {
  createContractPermission,
  createExplicitSessionConfig,
  getNetwork,
  LocalStorageKey,
  SEQUENCE_VALUE_FORWARDER,
  type ExplicitSessionParams,
  type Permission
} from '@0xsequence/connect'
import {
  DappClient,
  Relayer,
  type ExplicitSessionConfig,
  type TransactionRequest as DappClientTransactionRequest
} from '@0xsequence/dapp-client'
import type { FeeToken } from '@0xsequence/waas'
import { v4 as uuidv4 } from 'uuid'
import {
  getAddress,
  parseEther,
  parseUnits,
  RpcError,
  zeroAddress,
  type Address,
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
  setEmail: (email: string) => void
  auxData?: Record<string, unknown>
}

export interface BaseSequenceV3ConnectorOptions {
  projectAccessKey: string
  walletUrl: string
  dappOrigin: string
  defaultNetwork: number
  loginType: 'email' | 'google' | 'apple' | 'passkey'
  explicitSessionParams?: ExplicitSessionParams
  enableImplicitSession?: boolean
  includeFeeOptionPermissions?: boolean
  nodesUrl?: string
  relayerUrl?: string
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
  type StorageItem = {
    [LocalStorageKey.V3ActiveLoginType]: string
  }

  const client = new DappClient(params.walletUrl, params.dappOrigin, params.projectAccessKey, {
    nodesUrl: params.nodesUrl,
    relayerUrl: params.relayerUrl
  })
  const provider = new SequenceV3Provider(
    client,
    params.defaultNetwork,
    params.nodesUrl,
    params.projectAccessKey,
    params.loginType,
    params.explicitSessionParams ? createExplicitSessionConfig(params.explicitSessionParams) : undefined,
    params.enableImplicitSession,
    params.includeFeeOptionPermissions
  )

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
      setEmail(email: string) {
        provider.setEmail(email)
      },
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
        if (accounts.length) {
          await config.storage?.setItem(LocalStorageKey.V3ActiveLoginType, params.loginType)
        } else {
          throw new Error('No accounts found')
        }
        const chainId = await this.getChainId()
        return { accounts, chainId }
      },

      async disconnect() {
        await config.storage?.removeItem(LocalStorageKey.V3ActiveLoginType)
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
        const activeV3Option = await config.storage?.getItem(LocalStorageKey.V3ActiveLoginType)
        if (params.loginType !== activeV3Option) {
          return false
        }
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
  private projectAccessKey: string
  private enableImplicitSession?: boolean
  private loginType: 'email' | 'google' | 'apple' | 'passkey'
  private initialSessionConfig?: ExplicitSessionConfig
  private includeFeeOptionPermissions?: boolean

  email?: string

  public setEmail(email: string) {
    if (this.loginType !== 'email') {
      throw new Error('setEmail can only be called when loginType is "email"')
    }
    this.email = email
  }

  public feeConfirmationHandler?: FeeOptionConfirmationHandler

  private readonly listeners = new Map<keyof EIP1193EventMap, Array<(...args: any[]) => void>>()

  constructor(
    private client: DappClient,
    defaultNetwork: number,
    nodesUrl = 'https://nodes.sequence.app',
    projectAccessKey: string,
    loginType: 'email' | 'google' | 'apple' | 'passkey',
    initialSessionConfig?: ExplicitSessionConfig,
    enableImplicitSession?: boolean,
    includeFeeOptionPermissions?: boolean
  ) {
    this.currentChainId = defaultNetwork
    this.nodesUrl = nodesUrl
    this.loginType = loginType
    this.initialSessionConfig = initialSessionConfig
    this.projectAccessKey = projectAccessKey
    this.enableImplicitSession = enableImplicitSession
    this.includeFeeOptionPermissions = includeFeeOptionPermissions || false
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
        let finalPermissions: Permission[] = this.initialSessionConfig ? [...this.initialSessionConfig.permissions] : []
        let feeOptions: { isFeeRequired: boolean; tokens: FeeToken[]; paymentAddress: Address } = {
          isFeeRequired: false,
          tokens: [],
          paymentAddress: zeroAddress
        }
        if (this.includeFeeOptionPermissions) {
          const options = {
            method: 'POST',
            headers: {
              'X-Access-Key': this.projectAccessKey,
              'Content-Type': 'application/json'
            },
            body: '{}'
          }
          const chainName = getNetwork(this.currentChainId).name
          feeOptions = await fetch(`https://${chainName}-relayer.sequence.app/rpc/Relayer/FeeTokens`, options).then(res =>
            res.json()
          )

          const feeOptionPermissions = feeOptions.isFeeRequired
            ? feeOptions.tokens.map(option =>
                createContractPermission({
                  address: option.contractAddress as Address,
                  functionSignature: 'function transfer(address to, uint256 value)',
                  rules: [
                    {
                      param: 'value',
                      type: 'uint256',
                      condition: 'LESS_THAN_OR_EQUAL',
                      value: option.decimals === 18 ? parseEther('0.1') : parseUnits('50', option.decimals || 6)
                    },
                    {
                      param: 'to',
                      type: 'address',
                      condition: 'EQUAL',
                      value: feeOptions.paymentAddress
                    }
                  ]
                })
              )
            : []

          // Combine initial permissions with fee option permissions
          finalPermissions = [...finalPermissions, ...feeOptionPermissions]

          // Add the value forwarder permissions for native fee token spending if not added already
          const hasValueForwarderPermission = finalPermissions.find(permission => permission.target === SEQUENCE_VALUE_FORWARDER)
          if (!hasValueForwarderPermission) {
            finalPermissions.push({
              target: SEQUENCE_VALUE_FORWARDER,
              rules: []
            })
          }
        }

        await this.client.connect(
          this.currentChainId,
          this.initialSessionConfig
            ? {
                ...this.initialSessionConfig,
                permissions: finalPermissions,
                valueLimit: this.initialSessionConfig?.valueLimit || 0n,
                deadline: this.initialSessionConfig?.deadline || 0n,
                chainId: this.currentChainId
              }
            : feeOptions.isFeeRequired && this.includeFeeOptionPermissions
              ? {
                  deadline: BigInt(Math.floor(Date.now() / 1000)) + BigInt(60 * 60 * 24 * 7),
                  valueLimit: parseEther('0.1'),
                  chainId: this.currentChainId,
                  permissions: finalPermissions
                }
              : undefined,
          {
            preferredLoginMethod: this.loginType,
            ...(this.loginType === 'email' && this.email ? { email: this.email } : {}),
            ...(this.enableImplicitSession ? { includeImplicitSession: this.enableImplicitSession } : {})
          }
        )
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
          const unsubscribe = this.client.on('walletActionResponse', (data: any) => {
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
          const unsubscribe = this.client.on('walletActionResponse', (data: any) => {
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

      case 'wallet_sendTransaction':
      case 'eth_sendTransaction': {
        if (!params || !Array.isArray(params) || !params[0]) {
          throw new RpcError(new Error('Invalid params for eth_sendTransaction'), {
            code: -32602,
            shortMessage: 'Invalid params for eth_sendTransaction'
          })
        }
        const tx = params[0] as TransactionRequest
        const transactions = [{ to: tx.to!, value: BigInt(tx.value?.toString() ?? '0'), data: tx.data ?? '0x' }]

        const hasPermission = await this.client.hasPermission(this.currentChainId, transactions)

        if (hasPermission) {
          const feeOptions = await this.client.getFeeOptions(this.currentChainId, transactions)
          let selectedFeeOption: Relayer.FeeOption | undefined

          if (feeOptions && feeOptions.length > 0) {
            if (this.feeConfirmationHandler) {
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
          }
          // @note no fee option selected, in this case dapp should sponsor the transaction
          return this.client.sendTransaction(this.currentChainId, transactions, selectedFeeOption)
        } else {
          return new Promise((resolve, reject) => {
            const unsubscribe = this.client.on('walletActionResponse', (data: any) => {
              unsubscribe()
              if (data.error) {
                reject(new RpcError(new Error(data.error), { code: 4001, shortMessage: data.error }))
              } else {
                resolve(data.response.transactionHash)
              }
            })

            if (!tx.to) {
              const error = new RpcError(new Error('Transaction requires a "to" address.'), {
                code: -32602,
                shortMessage: 'Invalid transaction params'
              })
              unsubscribe()
              reject(error)
              return
            }

            const walletTransactionRequest: DappClientTransactionRequest = {
              to: tx.to,
              value: tx.value,
              data: tx.data,
              gasLimit: tx.gas
            }

            this.client.sendWalletTransaction(this.currentChainId, walletTransactionRequest).catch(err => {
              unsubscribe()
              reject(err)
            })
          })
        }
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
        const nodeUrl = getRpcUrl(this.nodesUrl, this.projectAccessKey, getNetwork(this.currentChainId).name)
        const res = await fetch(nodeUrl, {
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

const getRpcUrl = (nodesUrl: string, projectAccessKey: string, networkName: string) => {
  let url = applyTemplate(nodesUrl, { network: networkName })

  if (nodesUrl.includes('sequence')) {
    url = `${url}/${projectAccessKey}`
  }

  return url
}

function applyTemplate(template: string, values: Record<string, string>) {
  return template.replace(/{(.*?)}/g, (_, key) => {
    const value = values[key]
    if (value === undefined) {
      throw new Error(`Missing template value for ${template}: ${key}`)
    }
    return value
  })
}
