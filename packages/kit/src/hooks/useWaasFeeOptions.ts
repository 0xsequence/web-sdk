import { FeeOption } from '@0xsequence/waas'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import { Connector, useConnections } from 'wagmi'

import { Deferred } from '../utils/deferred'

// null means it's native token
let _pendingFeeConfirmation: Deferred<{ id: string; feeTokenAddress?: string | null; confirmed: boolean }> | undefined

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

  function confirmPendingFeeOption(id: string, feeTokenAddress: string | null) {
    _pendingFeeConfirmation?.resolve({ id, feeTokenAddress, confirmed: true })
    setPendingFeeOptionConfirmation(undefined)
    _pendingFeeConfirmation = undefined
  }

  function rejectPendingFeeOption(id: string) {
    _pendingFeeConfirmation?.resolve({ id, feeTokenAddress: undefined, confirmed: false })
    setPendingFeeOptionConfirmation(undefined)
    _pendingFeeConfirmation = undefined
  }

  useEffect(() => {
    async function setup() {
      if (!waasConnector) {
        return
      }

      // @ts-ignore-next-line
      const waasProvider = waasConnector.sequenceWaasProvider

      if (!waasProvider) {
        return
      }

      waasProvider.feeConfirmationHandler = {
        confirmFeeOption(
          id: string,
          options: FeeOption[],
          txs: ethers.Transaction[],
          chainId: number
        ): Promise<{ id: string; feeTokenAddress?: string | null; confirmed: boolean }> {
          const pending = new Deferred<{ id: string; confirmed: boolean }>()
          setPendingFeeOptionConfirmation({ id, options, chainId })
          _pendingFeeConfirmation = pending
          return pending.promise
        }
      }
    }
    setup()
  })

  return [pendingFeeOptionConfirmation, confirmPendingFeeOption, rejectPendingFeeOption]
}
