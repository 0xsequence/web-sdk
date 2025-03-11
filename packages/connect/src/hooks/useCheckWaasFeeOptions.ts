'use client'

import { FeeOption, Transaction } from '@0xsequence/waas'
import { useConnections } from 'wagmi'

export function useCheckWaasFeeOptions(): (params: { transactions: Transaction[]; chainId: number }) => Promise<{
  feeQuote: string | undefined
  feeOptions: FeeOption[] | undefined
  isSponsored: boolean
}> {
  const connections = useConnections()
  const waasConnector = connections.find(c => c.connector.id.includes('waas'))?.connector

  return async ({ transactions, chainId }) => {
    if (!waasConnector) {
      return {
        feeQuote: undefined,
        feeOptions: undefined,
        isSponsored: true
      }
    }

    const waasProvider = (waasConnector as any).sequenceWaasProvider
    if (!waasProvider) {
      return {
        feeQuote: undefined,
        feeOptions: undefined,
        isSponsored: true
      }
    }

    return waasProvider.checkTransactionFeeOptions({ transactions, chainId })
  }
}
