'use client'

import { useEffect, useState } from 'react'
import { useConnections } from 'wagmi'

import type { WaasFeeOptionConfirmationHandler, WaasRequestConfirmationHandler } from '../connectors/wagmiConnectors/sequenceWaasConnector.js'

export function useWaasConfirmationHandler(waasConnector?: { id: string }) {
  const connections = useConnections()
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)
  const [pendingRequestType, setPendingRequestType] = useState<'transaction' | 'message' | null>(null)
  const [pendingFeeOptionRequestId, setPendingFeeOptionRequestId] = useState<string | null>(null)

  useEffect(() => {
    const connector = waasConnector || connections.find(c => c.connector.id.includes('waas'))?.connector
    if (!connector) {
      return
    }

    const waasProvider = (connector as any).sequenceWaasProvider
    if (!waasProvider) {
      return
    }

    const handler: WaasRequestConfirmationHandler = {
      confirmSignTransactionRequest: async (id, _txs, _chainId) => {
        setPendingRequestId(id)
        setPendingRequestType('transaction')
        return { id, confirmed: false }
      },
      confirmSignMessageRequest: async (id, _message, _chainId) => {
        setPendingRequestId(id)
        setPendingRequestType('message')
        return { id, confirmed: false }
      }
    }

    const feeHandler: WaasFeeOptionConfirmationHandler = {
      confirmFeeOption: async (id, _options, _txs, _chainId) => {
        setPendingFeeOptionRequestId(id)
        return { id, confirmed: false }
      }
    }

    waasProvider.requestConfirmationHandler = handler
    waasProvider.feeConfirmationHandler = feeHandler

    return () => {
      if (waasProvider.requestConfirmationHandler === handler) {
        waasProvider.requestConfirmationHandler = undefined
      }
      if (waasProvider.feeConfirmationHandler === feeHandler) {
        waasProvider.feeConfirmationHandler = undefined
      }
    }
  }, [connections, waasConnector])

  const confirmPendingRequest = () => {
    setPendingRequestId(null)
    setPendingRequestType(null)
  }

  const rejectPendingRequest = () => {
    setPendingRequestId(null)
    setPendingRequestType(null)
  }

  const confirmPendingFeeOption = () => {
    setPendingFeeOptionRequestId(null)
  }

  const rejectPendingFeeOption = () => {
    setPendingFeeOptionRequestId(null)
  }

  return {
    pendingRequestId,
    pendingRequestType,
    confirmPendingRequest,
    rejectPendingRequest,
    pendingFeeOptionRequestId,
    confirmPendingFeeOption,
    rejectPendingFeeOption
  }
}
