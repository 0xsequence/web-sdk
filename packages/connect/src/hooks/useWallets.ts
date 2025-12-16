'use client'

import { SequenceAPIClient, type GetLinkedWalletsRequest, type LinkedWallet } from '@0xsequence/api'
import { useAPIClient } from '@0xsequence/hooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, useConnect, useConnections, useDisconnect, type Connector, type UseConnectionsReturnType } from 'wagmi'

import { useOptionalConnectConfigContext } from '../contexts/ConnectConfig.js'
import type { ExtendedConnector } from '../types.js'
import { getCachedProjectName, normalizeWalletUrl } from '../utils/walletConfiguration.js'

import { useWaasGetLinkedWalletsSignature } from './useWaasGetLinkedWalletsSignature.js'

interface UseLinkedWalletsOptions {
  enabled?: boolean
}

// Create a stable storage key from args
const createStorageKey = (args: GetLinkedWalletsRequest): string =>
  `@0xsequence.linked_wallets-${args.parentWalletAddress}-${args.signatureChainId}`

const getLinkedWallets = async (
  apiClient: SequenceAPIClient,
  args: GetLinkedWalletsRequest,
  headers?: object,
  signal?: AbortSignal
): Promise<Array<LinkedWallet>> => {
  const storageKey = createStorageKey(args)
  const now = Date.now()

  // Check localStorage for cached data
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    try {
      const { data, timestamp } = JSON.parse(stored)
      // Check if cache is still valid (5 minutes)
      if (now - timestamp <= 5 * 60 * 1000) {
        return data
      }
    } catch (error) {
      console.error('Error parsing stored linked wallets:', error)
    }
  }

  // If no valid cache, fetch new data
  const result = await apiClient.getLinkedWallets(args, headers, signal)
  const linkedWallets = result.linkedWallets

  // Store in localStorage with timestamp
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      data: linkedWallets,
      timestamp: now
    })
  )

  return linkedWallets
}

export interface UseLinkedWalletsResult {
  data: LinkedWallet[] | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  clearCache: () => void
}

// --- Listener pattern for cross-instance updates ---
const linkedWalletsListeners: Set<() => Promise<void>> = new Set()
const notifyLinkedWalletsListeners = () => {
  // Use setTimeout to ensure notification happens after the current execution context,
  // allowing React state updates to potentially settle before listeners run.
  setTimeout(() => {
    linkedWalletsListeners.forEach(listener => listener())
  }, 0)
}

export const useLinkedWallets = (
  args: GetLinkedWalletsRequest,
  options: UseLinkedWalletsOptions = {}
): UseLinkedWalletsResult => {
  const apiClient = useAPIClient()
  const [data, setData] = useState<LinkedWallet[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | undefined>(undefined)

  const fetchData = useCallback(async () => {
    if (!options.enabled) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Cancel any ongoing request
      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()

      // @ts-ignore
      const linkedWallets = await getLinkedWallets(apiClient, args, undefined, abortControllerRef.current.signal)

      setData(linkedWallets)
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setError(error)
      } else if (error && typeof error === 'object' && 'name' in error && error.name !== 'AbortError') {
        setError(new Error('Failed to fetch linked wallets'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [apiClient, args.parentWalletAddress, args.signatureChainId, options.enabled])

  // Fetch on mount, when dependencies change, and register/unregister listener
  useEffect(() => {
    // Register the listener
    linkedWalletsListeners.add(fetchData)

    // Initial fetch
    fetchData()

    // Cleanup: remove listener and abort ongoing request
    return () => {
      linkedWalletsListeners.delete(fetchData)
      abortControllerRef.current?.abort()
    }
  }, [fetchData])

  const clearCache = useCallback(() => {
    localStorage.removeItem(createStorageKey(args))
  }, [args])

  const refetch = async () => {
    clearCache()
    await fetchData()
    // Notify other hook instances after successful fetch
    notifyLinkedWalletsListeners()
  }

  return {
    data,
    isLoading,
    error,
    refetch,
    clearCache
  }
}

/**
 * Information about a connected wallet.
 *
 * @property {string} id - Unique identifier for the wallet (connector id)
 * @property {string} name - Display name of the wallet
 * @property {string} address - The wallet's Ethereum address
 * @property {boolean} isActive - Whether this wallet is currently active
 * @property {boolean} isEmbedded - Whether this is an embedded wallet (WaaS)
 */
export interface ConnectedWallet {
  id: string
  name: string
  address: string
  isActive: boolean
  isEmbedded: boolean
  signInMethod: string
}

/**
 * Return type for the useWallets hook.
 *
 * @property {ConnectedWallet[]} wallets - Array of all connected wallets
 * @property {LinkedWallet[] | undefined} linkedWallets - Array of linked wallets for the active embedded wallet (if any)
 * @property {function(address: string): Promise<void>} setActiveWallet - Function to set a wallet as active
 * @property {function(address: string): Promise<void>} disconnectWallet - Function to disconnect a wallet
 * @property {function(): Promise<void>} refetchLinkedWallets - Function to refresh the list of linked wallets
 */
export interface UseWalletsReturnType {
  wallets: ConnectedWallet[]
  linkedWallets: LinkedWallet[] | undefined
  setActiveWallet: (address: string) => Promise<void>
  disconnectWallet: (address: string) => Promise<void>
  refetchLinkedWallets: () => Promise<void>
}

/**
 * Hook to manage connected wallets.
 *
 * This hook provides information about all connected wallets, including both
 * embedded wallets (WaaS) and external wallets. It also allows managing these
 * connections by setting active wallets or disconnecting them.
 *
 * For embedded wallets, it also provides access to linked wallets - additional
 * wallets that have been linked to the primary embedded wallet.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/wallet-sdk/ecosystem/hooks/useWallets} for more detailed documentation.
 *
 * @returns An object containing wallet information and management functions {@link UseWalletsReturnType}
 *
 * @example
 * ```tsx
 * import { useWallets } from '@0xsequence/connect'
 *
 * const YourComponent = () => {
 *   const { wallets, setActiveWallet, disconnectWallet } = useWallets()
 *
 *   return (
 *     <div>
 *       <h2>Connected Wallets</h2>
 *       <div>
 *         {wallets.map(wallet => (
 *           <div key={wallet.address}>
 *             <span>{wallet.name}: {wallet.address}</span>
 *             {wallet.isActive ? ' (Active)' : ''}
 *             {wallet.isEmbedded ? ' (Embedded)' : ''}
 *             <button onClick={() => setActiveWallet(wallet.address)}>
 *               Set Active
 *             </button>
 *             <button onClick={() => disconnectWallet(wallet.address)}>
 *               Disconnect
 *             </button>
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   )
 * }
 * ```
 */

export const useWallets = (): UseWalletsReturnType => {
  const { address, status: accountStatus } = useAccount()
  const connections = useConnections()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const connectConfig = useOptionalConnectConfigContext()
  const normalizedWalletUrl = connectConfig?.walletUrl ? normalizeWalletUrl(connectConfig.walletUrl) : ''
  const sequenceProjectName =
    connectConfig?.signIn?.projectName || (normalizedWalletUrl ? getCachedProjectName(normalizedWalletUrl) : undefined)

  const waasConnection = connections.find(c => (c.connector as ExtendedConnector)?.type === 'sequence-waas')

  const {
    message: linkedWalletsMessage,
    signature: linkedWalletsSignature,
    address: linkedWalletsWaasAddress,
    chainId: linkedWalletsSigChainId
  } = useWaasGetLinkedWalletsSignature(waasConnection)

  // Only fetch if we have valid data
  const hasValidData = !!(linkedWalletsWaasAddress && linkedWalletsMessage && linkedWalletsSignature)

  const {
    data: linkedWallets,
    refetch: refetchLinkedWallets,
    clearCache: clearLinkedWalletsCache
  } = useLinkedWallets(
    {
      parentWalletAddress: linkedWalletsWaasAddress || '',
      parentWalletMessage: linkedWalletsMessage || '',
      parentWalletSignature: linkedWalletsSignature || '',
      signatureChainId: `${linkedWalletsSigChainId}`
    },
    {
      enabled: hasValidData
    }
  )

  const ecosystemProjectName = connectConfig?.signIn?.projectName
  const [loginMethodVersion, setLoginMethodVersion] = useState(0)

  // Keep track of the last non-empty connections list so we can present stable data while wagmi reconnects.
  const lastKnownConnectionsRef = useRef<UseConnectionsReturnType>([])
  useEffect(() => {
    if (connections.length > 0) {
      lastKnownConnectionsRef.current = connections
    }
  }, [connections])

  const baseConnections: UseConnectionsReturnType = useMemo(() => {
    const isReconnecting = accountStatus === 'connecting' || accountStatus === 'reconnecting'
    if (connections.length === 0 && isReconnecting && lastKnownConnectionsRef.current.length > 0) {
      return lastKnownConnectionsRef.current
    }
    return connections
  }, [connections, accountStatus])

  useEffect(() => {
    const unsubscribers: Array<() => void> = []
    baseConnections.forEach(connection => {
      if (connection.connector.type === 'sequence-v3-wallet') {
        const client = (connection.connector as any)?.client
        if (client?.on) {
          const handler = () => setLoginMethodVersion(v => v + 1)
          const unsubscribe = client.on('sessionsUpdated', handler)
          if (unsubscribe) {
            unsubscribers.push(unsubscribe)
          }
        }
      }
    })
    return () => {
      unsubscribers.forEach(unsub => {
        try {
          unsub()
        } catch {
          // ignore
        }
      })
    }
  }, [baseConnections])

  const walletsFromConnections = useMemo(() => {
    let hasPendingV3LoginMethod = false

    const list: ConnectedWallet[] = baseConnections.map((connection: UseConnectionsReturnType[number]) => {
      const signInMethod = getSignInMethod(connection)
      if (connection.connector.type === 'sequence-v3-wallet' && signInMethod === 'unknown') {
        hasPendingV3LoginMethod = true
      }

      return {
        id: connection.connector.id,
        name: getConnectorName(connection.connector, sequenceProjectName, ecosystemProjectName),
        address: connection.accounts[0],
        isActive: connection.accounts[0] === address,
        isEmbedded: connection.connector.id.includes('waas'),
        signInMethod
      }
    })

    const sorted = list.sort((a, b) => {
      if (a.id !== b.id) {
        return a.id.localeCompare(b.id)
      }
      return a.address.toLowerCase().localeCompare(b.address.toLowerCase())
    })

    return { list: sorted, hasPendingV3LoginMethod }
  }, [baseConnections, sequenceProjectName, ecosystemProjectName, address, loginMethodVersion])

  // Preserve the last non-empty wallet list while wagmi is reconnecting to avoid UI flicker on refresh.
  const [stableWallets, setStableWallets] = useState<ConnectedWallet[]>(
    walletsFromConnections.hasPendingV3LoginMethod || walletsFromConnections.list.length === 0 ? [] : walletsFromConnections.list
  )
  useEffect(() => {
    if (walletsFromConnections.hasPendingV3LoginMethod) {
      return
    }
    const nextList = walletsFromConnections.list
    if (nextList.length === 0) {
      return
    }

    const timer = setTimeout(() => {
      setStableWallets(prev => (areWalletListsEqual(prev, nextList) ? prev : nextList))
    }, 120)

    return () => {
      clearTimeout(timer)
    }
  }, [walletsFromConnections])

  const setActiveWallet = async (walletAddress: string) => {
    const connection = connections.find(
      (c: UseConnectionsReturnType[number]) => c.accounts[0].toLowerCase() === walletAddress.toLowerCase()
    )
    const connectionFromCache = lastKnownConnectionsRef.current.find(
      (c: UseConnectionsReturnType[number]) => c.accounts[0].toLowerCase() === walletAddress.toLowerCase()
    )
    const connectionToUse = connection || connectionFromCache

    if (!connectionToUse) {
      console.error('No connection found for wallet address:', walletAddress)
      return
    }

    // Do not try to change if it's already active
    if (stableWallets.find((w: ConnectedWallet) => w.address.toLowerCase() === walletAddress.toLowerCase())?.isActive) {
      return
    }

    try {
      await connectAsync({ connector: connectionToUse.connector })
    } catch (error) {
      console.error('Failed to set active wallet:', error)
    }
  }

  const disconnectWallet = async (walletAddress: string) => {
    const connection = connections.find(
      (c: UseConnectionsReturnType[number]) => c.accounts[0].toLowerCase() === walletAddress.toLowerCase()
    )
    if (!connection) {
      return
    }

    // invalidate linked wallets if we're disconnecting waas wallet
    if (connection.connector.id.includes('waas')) {
      clearLinkedWalletsCache()
    }

    try {
      await disconnectAsync({ connector: connection.connector })
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  return {
    wallets: stableWallets,
    linkedWallets,
    setActiveWallet,
    disconnectWallet,
    refetchLinkedWallets
  }
}

const getConnectorName = (connector: Connector, sequenceProjectName?: string, ecosystemProjectName?: string) => {
  const connectorName = connector.name
  const connectorWalletName = (connector._wallet as any)?.name

  if (sequenceProjectName && connector.type === 'sequence-v3-wallet') {
    return sequenceProjectName
  }

  if ((connector as any)._wallet?.isEcosystemWallet && ecosystemProjectName) {
    return ecosystemProjectName
  }

  return connectorWalletName ?? connectorName
}

const getSignInMethod = (connection: UseConnectionsReturnType[number]) => {
  const walletId = (connection.connector._wallet as any)?.id as string | undefined
  const connectorId = connection.connector.id
  const lowerId = connectorId.toLowerCase()
  const address = connection.accounts[0]

  if (connection.connector.type === 'sequence-v3-wallet') {
    const fromV3Client =
      ((connection.connector as any)?.loginMethod as string | undefined) ||
      ((connection.connector as any)?.client?.loginMethod as string | undefined)

    if (fromV3Client) {
      setCachedLoginMethod(connectorId, address, fromV3Client)
      return fromV3Client
    }

    const cached = getCachedLoginMethod(connectorId, address)
    return cached ?? 'unknown'
  }

  return (
    walletId ||
    (lowerId.includes('metamask') ? 'metamask-wallet' : lowerId.includes('coinbase') ? 'coinbase-wallet' : connectorId)
  )
}

const areWalletListsEqual = (a: ConnectedWallet[], b: ConnectedWallet[]) => {
  if (a === b) {
    return true
  }
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i].address.toLowerCase() !== b[i].address.toLowerCase()) {
      return false
    }
    if (a[i].id !== b[i].id) {
      return false
    }
    if (a[i].isActive !== b[i].isActive) {
      return false
    }
    if (a[i].name !== b[i].name) {
      return false
    }
    if (a[i].signInMethod !== b[i].signInMethod) {
      return false
    }
    if (a[i].isEmbedded !== b[i].isEmbedded) {
      return false
    }
  }
  return true
}

const LOGIN_METHOD_CACHE_PREFIX = '@0xsequence.loginMethod'

const getCachedLoginMethod = (connectorId: string, address: string) => {
  try {
    if (typeof window === 'undefined') {
      return undefined
    }
    const key = `${LOGIN_METHOD_CACHE_PREFIX}:${connectorId}:${address.toLowerCase()}`
    return window.localStorage.getItem(key) || undefined
  } catch {
    return undefined
  }
}

const setCachedLoginMethod = (connectorId: string, address: string, value: string) => {
  try {
    if (typeof window === 'undefined') {
      return
    }
    const key = `${LOGIN_METHOD_CACHE_PREFIX}:${connectorId}:${address.toLowerCase()}`
    window.localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}
