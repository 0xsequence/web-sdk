'use client'

import { SequenceAPIClient, GetLinkedWalletsArgs, LinkedWallet } from '@0xsequence/api'
import { useAPIClient } from '@0xsequence/react-hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Connector, type UseConnectionsReturnType, useAccount, useConnect, useConnections, useDisconnect } from 'wagmi'

import { SEQUENCE_UNIVERSAL_CONNECTOR_NAME } from '../components/Connect/Connect'
import { ExtendedConnector } from '../types'

import { useWaasGetLinkedWalletsSignature } from './useWaasGetLinkedWalletsSignature'

interface UseLinkedWalletsOptions {
  enabled?: boolean
}

// Create a stable storage key from args
const createStorageKey = (args: GetLinkedWalletsArgs): string =>
  `@0xsequence.linked_wallets-${args.parentWalletAddress}-${args.signatureChainId}`

const getLinkedWallets = async (
  apiClient: SequenceAPIClient,
  args: GetLinkedWalletsArgs,
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

export const useLinkedWallets = (args: GetLinkedWalletsArgs, options: UseLinkedWalletsOptions = {}): UseLinkedWalletsResult => {
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

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchData()
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [fetchData])

  const clearCache = useCallback(() => {
    localStorage.removeItem(createStorageKey(args))
  }, [args])

  const refetch = async () => {
    clearCache()
    await fetchData()
  }

  return {
    data,
    isLoading,
    error,
    refetch,
    clearCache
  }
}

export interface ConnectedWallet {
  id: string
  name: string
  address: string
  isActive: boolean
  isEmbedded: boolean
}

export const useWallets = () => {
  const { address } = useAccount()
  const connections = useConnections()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()

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

  const wallets: ConnectedWallet[] = connections.map((connection: UseConnectionsReturnType[number]) => ({
    id: connection.connector.id,
    name: getConnectorName(connection.connector),
    address: connection.accounts[0],
    isActive: connection.accounts[0] === address,
    isEmbedded: connection.connector.id.includes('waas')
  }))

  const setActiveWallet = async (walletAddress: string) => {
    const connection = connections.find((c: UseConnectionsReturnType[number]) => c.accounts[0] === walletAddress)
    if (!connection) {
      return
    }

    try {
      await connectAsync({ connector: connection.connector })
    } catch (error) {
      console.error('Failed to set active wallet:', error)
    }
  }

  const disconnectWallet = async (walletAddress: string) => {
    const connection = connections.find((c: UseConnectionsReturnType[number]) => c.accounts[0] === walletAddress)
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
    wallets,
    linkedWallets,
    setActiveWallet,
    disconnectWallet,
    refetchLinkedWallets
  }
}

const getConnectorName = (connector: Connector) => {
  const connectorName = connector.name
  const connectorWalletName = (connector._wallet as any)?.name

  if (connectorName === SEQUENCE_UNIVERSAL_CONNECTOR_NAME) {
    return 'Sequence Universal'
  }

  return connectorWalletName ?? connectorName
}
