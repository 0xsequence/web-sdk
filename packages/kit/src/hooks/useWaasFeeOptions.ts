'use client'

import { FeeOption } from '@0xsequence/waas'
import { ethers } from 'ethers'
import { useState, useEffect, useRef } from 'react'
import { Connector, useConnections } from 'wagmi'

import { Deferred } from '../utils/deferred'

export type WaasFeeOptionConfirmation = {
  id: string
  options: FeeOption[]
  chainId: number
}

export function useWaasFeeOptions(): [
  WaasFeeOptionConfirmation | undefined,
  (id: string, feeTokenAddress: string | null) => void,
  (id: string) => void
] {
  const connections = useConnections()
  const waasConnector: Connector | undefined = connections.find(c => c.connector.id.includes('waas'))?.connector
  const [pendingFeeOptionConfirmation, setPendingFeeOptionConfirmation] = useState<WaasFeeOptionConfirmation | undefined>()
  const pendingConfirmationRef = useRef<Deferred<{ id: string; feeTokenAddress?: string | null; confirmed: boolean }>>()

  function confirmPendingFeeOption(id: string, feeTokenAddress: string | null) {
    if (pendingConfirmationRef.current) {
      pendingConfirmationRef.current.resolve({ id, feeTokenAddress, confirmed: true })
      setPendingFeeOptionConfirmation(undefined)
      pendingConfirmationRef.current = undefined
    }
  }

  function rejectPendingFeeOption(id: string) {
    if (pendingConfirmationRef.current) {
      pendingConfirmationRef.current.resolve({ id, feeTokenAddress: undefined, confirmed: false })
      setPendingFeeOptionConfirmation(undefined)
      pendingConfirmationRef.current = undefined
    }
  }

  useEffect(() => {
    if (!waasConnector) {
      return
    }

    const waasProvider = (waasConnector as any).sequenceWaasProvider
    if (!waasProvider) {
      return
    }

    const originalHandler = waasProvider.feeConfirmationHandler

    waasProvider.feeConfirmationHandler = {
      confirmFeeOption(
        id: string,
        options: FeeOption[],
        txs: ethers.Transaction[],
        chainId: number
      ): Promise<{ id: string; feeTokenAddress?: string | null; confirmed: boolean }> {
        const pending = new Deferred<{ id: string; feeTokenAddress?: string | null; confirmed: boolean }>()
        pendingConfirmationRef.current = pending
        setPendingFeeOptionConfirmation({ id, options, chainId })
        return pending.promise
      }
    }

    return () => {
      waasProvider.feeConfirmationHandler = originalHandler
    }
  }, [waasConnector])

  return [pendingFeeOptionConfirmation, confirmPendingFeeOption, rejectPendingFeeOption]
}
