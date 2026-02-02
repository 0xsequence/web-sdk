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
  type ExplicitSessionConfig,
  type FeeOption,
  type FeeToken,
  type GetFeeTokensResponse
} from '@0xsequence/dapp-client'
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

type ConnectAccounts<withCapabilities extends boolean> = withCapabilities extends true
  ? readonly { address: Address; capabilities: Record<string, unknown> }[]
  : readonly Address[]

const resolveConnectAccounts = <withCapabilities extends boolean>(
  accounts: readonly Address[],
  withCapabilities?: withCapabilities | boolean
): ConnectAccounts<withCapabilities> => {
  return (
    withCapabilities ? accounts.map(address => ({ address, capabilities: {} })) : accounts
  ) as ConnectAccounts<withCapabilities>
}

export interface SequenceV3Connector extends Connector {
  type: 'sequence-v3-wallet'
  setEmail: (email: string) => void
  auxData?: Record<string, unknown>
  readonly client: DappClient
  /** The login method reported by the v3 client after authentication (e.g., ecosystem-v3, google, passkey, etc.) */
  readonly loginMethod?: string
  readonly loginOptions?: {
    loginType?: SequenceV3LoginType
    loginStorageKey?: string
  }
}

export type SequenceV3LoginType = 'email' | 'google' | 'apple' | 'passkey'

export interface BaseSequenceV3ConnectorOptions {
  projectAccessKey: string
  walletUrl: string
  dappOrigin: string
  defaultNetwork: number
  loginType?: SequenceV3LoginType
  loginStorageKey?: string
  explicitSessionParams?: ExplicitSessionParams
  enableImplicitSession?: boolean
  includeFeeOptionPermissions?: boolean
  nodesUrl?: string
  relayerUrl?: string
}

export interface FeeOptionConfirmationHandler {
  confirmFeeOption(
    id: string,
    options: FeeOption[],
    txs: TransactionRequest[],
    chainId: number
  ): Promise<{ id: string; feeOption?: FeeOption; confirmed: boolean }>
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

  const loginStorageKey = params.loginStorageKey ?? params.loginType

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
      get loginMethod() {
        return client.loginMethod ?? undefined
      },

      auxData: undefined as Record<string, unknown> | undefined,
      loginOptions: {
        loginType: params.loginType,
        loginStorageKey
      },

      async setup() {
        if (typeof window !== 'object') {
          return
        }
      },

      async connect<withCapabilities extends boolean = false>(_connectInfo?: {
        chainId?: number
        isReconnecting?: boolean
        withCapabilities?: withCapabilities | boolean
      }) {
        const accounts = await provider.request({ method: 'eth_requestAccounts' })
        const normalizedAccounts = accounts.map((account: string) => getAddress(account))
        const resolvedAccounts = resolveConnectAccounts(normalizedAccounts, _connectInfo?.withCapabilities)
        if (accounts.length) {
          if (loginStorageKey) {
            await config.storage?.setItem(LocalStorageKey.V3ActiveLoginType, loginStorageKey)
          } else {
            await config.storage?.removeItem(LocalStorageKey.V3ActiveLoginType)
          }
        } else {
          throw new Error('No accounts found')
        }
        const chainId = await this.getChainId()
        return { accounts: resolvedAccounts, chainId }
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
        if (loginStorageKey) {
          const activeV3Option = await config.storage?.getItem(LocalStorageKey.V3ActiveLoginType)
          if (loginStorageKey !== activeV3Option) {
            return false
          }
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
  private loginType?: SequenceV3LoginType
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
    loginType?: SequenceV3LoginType,
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
        let feeTokens: GetFeeTokensResponse = {
          isFeeRequired: false,
          tokens: [],
          paymentAddress: zeroAddress
        }
        if (this.includeFeeOptionPermissions) {
          try {
            feeTokens = await this.client.getFeeTokens(this.currentChainId)
          } catch (error) {
            throw new Error('Error getting fee options', { cause: error })
          }

          const feeOptionPermissions = feeTokens.isFeeRequired
            ? feeTokens.tokens?.map((token: FeeToken) =>
                createContractPermission({
                  address: token.contractAddress as Address,
                  functionSignature: 'function transfer(address to, uint256 value)',
                  rules: [
                    {
                      param: 'value',
                      type: 'uint256',
                      condition: 'LESS_THAN_OR_EQUAL',
                      value: token.decimals === 18 ? parseEther('0.1') : parseUnits('50', token.decimals || 6),
                      cumulative: true
                    },
                    {
                      param: 'to',
                      type: 'address',
                      condition: 'EQUAL',
                      value: feeTokens.paymentAddress as Address,
                      cumulative: false
                    }
                  ]
                })
              )
            : []

          // Combine initial permissions with fee option permissions
          finalPermissions = [...finalPermissions, ...(feeOptionPermissions || [])]

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
            : feeTokens.isFeeRequired && this.includeFeeOptionPermissions
              ? {
                  deadline: BigInt(Math.floor(Date.now() / 1000)) + BigInt(60 * 60 * 24 * 7),
                  valueLimit: parseEther('0.1'),
                  chainId: this.currentChainId,
                  permissions: finalPermissions
                }
              : undefined,
          {
            ...(this.loginType ? { preferredLoginMethod: this.loginType } : {}),
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
        if (!tx.to) {
          throw new RpcError(new Error('Transaction requires a "to" address.'), {
            code: -32602,
            shortMessage: 'Invalid transaction params'
          })
        }
        const transactions = [{ to: tx.to!, value: BigInt(tx.value?.toString() ?? '0'), data: tx.data ?? '0x' }]

        // @note feeConfirmationHandler will only be defined if the useFeeOptions hook is used anywhere in the app
        // if it is not used, we do not query fee options at all
        if (this.feeConfirmationHandler) {
          let feeOptions: FeeOption[] = []
          try {
            feeOptions = await this.client.getFeeOptions(this.currentChainId, transactions)
          } catch (error) {
            if (error instanceof Error && /signer supporting call is expired/i.test(error.message)) {
              throw new RpcError(new Error('Explicit session expired.'), {
                code: -32000,
                shortMessage: 'Session expired'
              })
            }
            let missingPermissionsDetail = ''
            let missingPermissionsShort = ''
            try {
              const perCall = await Promise.all(
                transactions.map(async (tx, index) => {
                  const allowed = await this.client.hasPermission(this.currentChainId, [tx])
                  return { index, allowed, tx }
                })
              )
              const denied = perCall.filter(item => !item.allowed)
              if (denied.length > 0) {
                const deniedSummary = denied
                  .map(
                    item =>
                      `[${item.index}] to=${item.tx.to}, value=${item.tx.value ?? 0n}, selector=${getSelector(item.tx.data)}, data=${String(item.tx.data ?? '0x').slice(0, 42)}...`
                  )
                  .join(', ')
                missingPermissionsDetail = ` Missing permission for call(s): ${deniedSummary}.`
                missingPermissionsShort = `Missing permission for ${denied.length} call(s).`
              }
            } catch {
              // ignore secondary permission probing errors
            }
            const message = formatProviderError(error)
            const shortMessage = missingPermissionsShort || 'Missing permission for transaction.'
            const baseMessage = `Missing permission for transaction.${missingPermissionsDetail}`
            const detailsMessage = message ? ` Underlying error: ${message}.` : ''
            throw new RpcError(new Error(`${baseMessage}${detailsMessage}`), {
              code: -32000,
              shortMessage
            })
          }
          let selectedFeeOption: FeeOption | undefined

          if (feeOptions && feeOptions.length > 0) {
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
          // @note if there is no selectedFeeOption, dapp should sponsor the transaction or network used should be testnet
          try {
            return await this.client.sendTransaction(this.currentChainId, transactions, selectedFeeOption)
          } catch (error) {
            if (error instanceof Error && /signer supporting call is expired/i.test(error.message)) {
              throw new RpcError(new Error('Explicit session expired.'), {
                code: -32000,
                shortMessage: 'Session expired'
              })
            }
            throw error
          }
        }

        // @note if there is no confirmation handler, dapp should sponsor the transaction
        try {
          return await this.client.sendTransaction(this.currentChainId, transactions)
        } catch (error) {
          if (error instanceof Error && /signer supporting call is expired/i.test(error.message)) {
            throw new RpcError(new Error('Explicit session expired.'), {
              code: -32000,
              shortMessage: 'Session expired'
            })
          }
          throw error
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

const getSelector = (data: unknown) => {
  if (typeof data !== 'string') {
    return 'unknown'
  }
  if (!data.startsWith('0x') || data.length < 10) {
    return 'unknown'
  }
  return data.slice(0, 10)
}

const formatProviderError = (error: unknown) => {
  if (!error) {
    return 'Unknown error.'
  }
  if (error instanceof Error) {
    const cause = (error as any).cause
    if (cause instanceof Error && cause.message) {
      return `${error.message} (${cause.message})`
    }
    return error.message
  }
  return String(error)
}
