import { SequenceWaaS } from '@0xsequence/waas'
import { useState } from 'react'
import { Connector } from 'wagmi'

import { useAPIClient } from './useAPIClient'

// Chain doesn't matter for linking, we can just hardcode a common one
const CHAIN_ID_FOR_SIGNATURE = 137

interface LinkWalletParams {
  signatureChainId: number
  connectorName: string
  childWalletAddress: string
  childMessage: string
  childSignature: string
}

interface UseWaasLinkWalletResult {
  linkWallet: (params: LinkWalletParams) => Promise<void>
  loading: boolean
  error: Error | null
}

export const useWaasLinkWallet = (connector: Connector | undefined): UseWaasLinkWalletResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const apiClient = useAPIClient()

  const linkWallet = async ({
    signatureChainId,
    connectorName,
    childWalletAddress,
    childMessage,
    childSignature
  }: LinkWalletParams) => {
    const sequenceWaas: SequenceWaaS | undefined = (connector as any)?.sequenceWaas

    try {
      setLoading(true)
      setError(null)

      const parentWalletAddress = await sequenceWaas?.getAddress()

      if (!parentWalletAddress) {
        throw new Error('Failed to fetch WaaS address')
      }

      const parentWalletMessage = 'Link child wallet with address: ' + childWalletAddress
      const parentWalletSignature = await sequenceWaas?.signMessage({
        message: parentWalletMessage,
        network: CHAIN_ID_FOR_SIGNATURE
      })

      if (!parentWalletSignature) {
        throw new Error('Failed to sign message')
      }

      await apiClient.linkWallet({
        signatureChainId: String(signatureChainId),
        linkedWalletType: connectorName,
        parentWalletAddress,
        parentWalletMessage,
        parentWalletSignature: parentWalletSignature.data.signature,
        linkedWalletAddress: childWalletAddress,
        linkedWalletMessage: childMessage,
        linkedWalletSignature: childSignature
      })
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return {
    linkWallet,
    loading,
    error
  }
}
