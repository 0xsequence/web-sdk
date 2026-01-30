'use client'

import type { DappClient, TransactionRequest as DappClientTransactionRequest } from '@0xsequence/dapp-client'
import { useCallback, useState } from 'react'
import type { TransactionRequest } from 'viem'
import { useConnections, type Connector } from 'wagmi'

export type SendWalletTransactionParams = {
  chainId: number
  transaction: TransactionRequest
}

export type UseSendWalletTransactionReturnType = {
  isLoading: boolean
  error: Error | null
  data: string | undefined
  sendTransaction: (params: SendWalletTransactionParams) => void
  sendTransactionAsync: (params: SendWalletTransactionParams) => Promise<string>
  reset: () => void
}

export function useSendWalletTransaction(): UseSendWalletTransactionReturnType {
  const connections = useConnections()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<string | undefined>(undefined)

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

  const sendTransactionAsync = useCallback(
    async ({ chainId, transaction }: SendWalletTransactionParams) => {
      const dappClient = getDappClient()

      setIsLoading(true)
      setError(null)
      setData(undefined)

      try {
        if (!transaction.to) {
          throw new Error('Transaction requires a "to" address.')
        }

        const walletTransactionRequest: DappClientTransactionRequest = {
          to: transaction.to,
          value: transaction.value,
          data: transaction.data,
          gasLimit: transaction.gas
        }

        return await new Promise<string>((resolve, reject) => {
          const unsubscribe = dappClient.on('walletActionResponse', (response: any) => {
            unsubscribe?.()
            if (response?.error) {
              const err = new Error(response.error)
              setError(err)
              reject(err)
              return
            }
            const txHash = response?.response?.transactionHash
            setData(txHash)
            resolve(txHash)
          })

          dappClient.sendWalletTransaction(chainId, walletTransactionRequest).catch((err: unknown) => {
            unsubscribe?.()
            const error = err instanceof Error ? err : new Error('Failed to send wallet transaction')
            setError(error)
            reject(error)
          })
        })
      } catch (e: any) {
        const err = e instanceof Error ? e : new Error('Failed to send wallet transaction')
        setError(err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [getDappClient]
  )

  const sendTransaction = useCallback(
    (params: SendWalletTransactionParams) => {
      sendTransactionAsync(params).catch(() => {})
    },
    [sendTransactionAsync]
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(undefined)
  }, [])

  return { isLoading, error, data, sendTransaction, sendTransactionAsync, reset }
}
