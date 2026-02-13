'use client'

import { useIndexerClient } from '@0xsequence/hooks'
import { ContractVerificationStatus } from '@0xsequence/indexer'
import type { FeeOption, Transaction } from '@0xsequence/waas'
import { useEffect, useState } from 'react'
import { formatUnits } from 'viem'
import type { Connector } from 'wagmi'
import { useConnections } from 'wagmi'

import { Deferred } from '../utils/deferred.js'

// Shared state across hook instances
let sharedPendingConfirmation: WaasFeeOptionConfirmation | undefined = undefined
let sharedDeferred: Deferred<{ id: string; feeTokenAddress?: string | null; confirmed: boolean }> | undefined = undefined
let listeners: React.Dispatch<React.SetStateAction<WaasFeeOptionConfirmation | undefined>>[] = []

const notifyListeners = (state: WaasFeeOptionConfirmation | undefined) => listeners.forEach(listener => listener(state))

export type FeeOptionExtended = FeeOption & {
  balance: string
  balanceFormatted: string
  hasEnoughBalanceForFee: boolean
}

export type WaasFeeOptionConfirmation = {
  id: string
  options: FeeOptionExtended[] | FeeOption[]
  chainId: number
}

export type UseWaasFeeOptionsReturnType = [
  pendingFeeOptionConfirmation: WaasFeeOptionConfirmation | undefined,
  confirmPendingFeeOption: (id: string, feeTokenAddress: string | null) => void,
  rejectPendingFeeOption: (id: string) => void
]

export interface WaasFeeOptionsConfig {
  skipFeeBalanceCheck?: boolean
  chainIdOverride?: number
}

export function useWaasFeeOptions(options?: WaasFeeOptionsConfig): UseWaasFeeOptionsReturnType {
  const { skipFeeBalanceCheck = false, chainIdOverride } = options ?? {}

  const [pendingFeeOptionConfirmation, setPendingFeeOptionConfirmation] = useState<WaasFeeOptionConfirmation | undefined>(
    sharedPendingConfirmation
  )
  const [confirmPromise, setConfirmPromise] = useState<Deferred<{
    id: string
    feeTokenAddress?: string | null
    confirmed: boolean
  }> | null>(null)

  const connections = useConnections()
  const waasConnection = connections.find(c => c.connector.id.includes('waas'))
  const waasConnector = waasConnection?.connector
  const chainIdForIndexer = chainIdOverride ?? waasConnection?.chainId ?? 1
  const indexerClient = useIndexerClient(chainIdForIndexer)

  useEffect(() => {
    listeners.push(setPendingFeeOptionConfirmation)
    return () => {
      listeners = listeners.filter(listener => listener !== setPendingFeeOptionConfirmation)
    }
  }, [])

  useEffect(() => {
    if (!waasConnector) {
      return
    }

    const waasProvider = (waasConnector as any).sequenceWaasProvider
    if (!waasProvider) {
      return
    }

    waasProvider.feeConfirmationHandler = {
      confirmFeeOption: async (id: string, options: FeeOption[], _txs: Transaction[], chainId: number) => {
        if (skipFeeBalanceCheck) {
          sharedPendingConfirmation = { id, options, chainId: chainIdOverride ?? chainId }
          sharedDeferred = new Deferred()
          notifyListeners(sharedPendingConfirmation)

          const confirmation = await sharedDeferred.promise
          sharedPendingConfirmation = undefined
          sharedDeferred = undefined
          notifyListeners(sharedPendingConfirmation)
          return confirmation
        }

        const accountAddress = waasConnection?.accounts?.[0]
        const balances = await indexerClient.getTokenBalancesDetails({
          filter: {
            accountAddresses: accountAddress ? [accountAddress] : [],
            omitNativeBalances: false
          }
        })

        const optionsWithBalances: FeeOptionExtended[] = options.map((option: FeeOption) => {
          const { token, value } = option
          const decimals = token.decimals ?? 18
          const rawValue = BigInt(value)
          const balance = token.contractAddress
            ? BigInt(balances.balances.find(({ contractAddress }) => contractAddress === token.contractAddress)?.balance ?? '0')
            : BigInt(balances.nativeBalances?.[0]?.balance ?? '0')

          return {
            ...option,
            balance: balance.toString(),
            balanceFormatted: formatUnits(balance, decimals),
            hasEnoughBalanceForFee: balance >= rawValue
          }
        })

        if (optionsWithBalances.length === 0) {
          throw new Error('No fee options with user balance available')
        }

        sharedPendingConfirmation = {
          id,
          options: optionsWithBalances,
          chainId: chainIdOverride ?? chainId
        }

        sharedDeferred = new Deferred()
        notifyListeners(sharedPendingConfirmation)

        const confirmation = await sharedDeferred.promise
        sharedPendingConfirmation = undefined
        sharedDeferred = undefined
        notifyListeners(sharedPendingConfirmation)
        return confirmation
      }
    }
  }, [waasConnector, indexerClient, skipFeeBalanceCheck, chainIdOverride])

  useEffect(() => {
    if (!pendingFeeOptionConfirmation) {
      setConfirmPromise(null)
      return
    }
    setConfirmPromise(sharedDeferred ?? null)
  }, [pendingFeeOptionConfirmation])

  const confirmPendingFeeOption = (id: string, feeTokenAddress: string | null) => {
    if (!confirmPromise) {
      return
    }
    confirmPromise.resolve({ id, feeTokenAddress, confirmed: true })
  }

  const rejectPendingFeeOption = (id: string) => {
    if (!confirmPromise) {
      return
    }
    confirmPromise.resolve({ id, confirmed: false })
  }

  return [pendingFeeOptionConfirmation, confirmPendingFeeOption, rejectPendingFeeOption]
}

export const getTokenName = (txs: Transaction[], tokenAddress: string | null) => {
  const isNativeToken = tokenAddress == null
  const token = isNativeToken
    ? { symbol: 'ETH', address: tokenAddress, decimal: 18 }
    : {
        symbol: (txs[0] as any)?.data?.token?.symbol,
        address: (txs[0] as any)?.data?.token?.contractAddress,
        decimal: (txs[0] as any)?.data?.token?.decimals
      }
  return token?.symbol
}

export const getTransactionMetadata = async (txs: Transaction[], connector: Connector | undefined, chainId: number) => {
  const metadata = await Promise.all(
    txs.map(async tx => {
      const txData = tx as any
      const erc20TokenAddress: string | null = txData?.data?.token?.contractAddress

      const res = {
        chainId,
        tokenName: getTokenName(txs, erc20TokenAddress),
        isNativeToken: erc20TokenAddress == null,
        erc20TokenAddress,
        erc20TokenDecimals: txData?.data?.token?.decimals,
        recipient: await (connector as any)?.getAccount?.(),
        isContract: undefined as undefined | boolean,
        verificationStatus: undefined as undefined | ContractVerificationStatus,
        abi: txData?.data?.contractMetadata?.abi,
        functionName: txData?.data?.functionSignature?.functionName,
        functionSignature: txData?.data?.functionSignature?.functionSignature
      }

      const receiver = txData?.to as string
      if (!receiver) {
        return res
      }

      try {
        const rc = await (connector as any)?.getPublicClient?.({ chainId })?.getBytecode({ address: receiver as `0x${string}` })
        if (rc && rc.length > 2) {
          res.isContract = true
          const { verifiedContractAddress, contractInfo } =
            txData?.data?.contractMetadata || txData?.data?.contractMetadataPreview || {}
          if (verifiedContractAddress && contractInfo?.status) {
            res.verificationStatus = contractInfo.status
          }
        } else {
          res.isContract = false
        }
      } catch (error) {
        console.log('error checking if address is a contract: ', error)
        res.isContract = false
      }

      return res
    })
  )

  return metadata
}
