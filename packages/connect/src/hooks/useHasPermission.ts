'use client'

import type { DappClient } from '@0xsequence/dapp-client'
import { useCallback, useState } from 'react'
import type { TransactionRequest } from 'viem'
import { useConnections, type Connector } from 'wagmi'

export type HasPermissionParams = {
  chainId: number
  transactions: TransactionRequest[]
}

export type UseHasPermissionReturnType = {
  isLoading: boolean
  error: Error | null
  data: boolean | undefined
  checkPermission: (params: HasPermissionParams) => Promise<boolean>
}

const buildPermissionTransactions = (transactions: TransactionRequest[]) => {
  return transactions.map(tx => {
    if (!tx.to) {
      throw new Error('Transaction requires a "to" address.')
    }

    return {
      to: tx.to,
      value: BigInt(tx.value?.toString() ?? '0'),
      data: tx.data ?? '0x'
    }
  })
}

export function useHasPermission(): UseHasPermissionReturnType {
  const connections = useConnections()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<boolean | undefined>(undefined)

  const getDappClient = useCallback((): DappClient => {
    const v3Connector: Connector | undefined = connections.find(c => c.connector.id.includes('sequence-v3-wallet'))?.connector

    if (!v3Connector) {
      const err = new Error('Sequence V3 connector not found. Make sure the user is connected.')
      setError(err)
      throw err
    }

    const dappClient = (v3Connector as any).client as DappClient

    if (!dappClient) {
      const err = new Error('DappClient instance is not available on the connector.')
      setError(err)
      throw err
    }

    return dappClient
  }, [connections])

  const checkPermission = useCallback(
    async ({ chainId, transactions }: HasPermissionParams) => {
      const dappClient = getDappClient()

      setIsLoading(true)
      setError(null)

      try {
        const normalizedTransactions = buildPermissionTransactions(transactions)
        const result = await dappClient.hasPermission(chainId, normalizedTransactions)
        setData(result)
        return result
      } catch (e: any) {
        const err = e instanceof Error ? e : new Error('Failed to check permission')
        setError(err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [getDappClient]
  )

  return { isLoading, error, data, checkPermission }
}
