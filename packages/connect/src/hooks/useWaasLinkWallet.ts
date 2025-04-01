'use client'

import { useAPIClient } from '@0xsequence/hooks'
import { SequenceWaaS } from '@0xsequence/waas'
import { useState } from 'react'
import { Connector } from 'wagmi'

import { CHAIN_ID_FOR_SIGNATURE } from '../constants/walletLinking'

/**
 * Parameters required for linking a child wallet to a parent WaaS wallet.
 */
interface LinkWalletParams {
  /** Chain ID used for the signature verification */
  signatureChainId: number
  /** Name of the connector used by the child wallet */
  connectorName: string
  /** Address of the child wallet to be linked */
  childWalletAddress: string
  /** Message signed by the child wallet */
  childMessage: string
  /** Signature from the child wallet */
  childSignature: string
}

/**
 * Result object returned by the useWaasLinkWallet hook.
 */
interface UseWaasLinkWalletResult {
  /** Function to link a child wallet to the parent WaaS wallet */
  linkWallet: (params: LinkWalletParams) => Promise<void>
  /** Function to remove a previously linked wallet */
  removeLinkedWallet: (linkedWalletAddress: string) => Promise<void>
  /** Whether a linking or unlinking operation is in progress */
  loading: boolean
  /** Any error that occurred during the operation */
  error: Error | null
}

/**
 * Hook to manage wallet linking operations for WaaS (Wallet-as-a-Service).
 *
 * This hook provides functionality to link and unlink child wallets to/from a parent WaaS wallet.
 * It handles the signature generation and API calls required for the linking process.
 *
 * The linking process involves:
 * 1. Getting the parent WaaS wallet address
 * 2. Signing a message with the parent wallet
 * 3. Submitting both parent and child signatures to the API
 *
 * The unlinking process involves:
 * 1. Getting the parent WaaS wallet address
 * 2. Signing a removal message
 * 3. Submitting the request to the API
 *
 * @param connector - The WaaS connector instance. Optional because the user might not have
 *                   a WaaS wallet connected yet.
 *
 * @returns An object containing:
 * - `linkWallet` - Function to link a child wallet
 * - `removeLinkedWallet` - Function to remove a linked wallet
 * - `loading` - Whether an operation is in progress
 * - `error` - Any error that occurred
 *
 * @example
 * ```tsx
 * const { linkWallet, removeLinkedWallet, loading, error } = useWaasLinkWallet(waasConnector)
 *
 * // Link a wallet
 * await linkWallet({
 *   signatureChainId: CHAIN_ID_FOR_SIGNATURE,
 *   connectorName: 'MetaMask',
 *   childWalletAddress: '0x...',
 *   childMessage: 'Link to parent wallet...',
 *   childSignature: '0x...'
 * })
 *
 * // Remove a linked wallet
 * await removeLinkedWallet('0x...')
 * ```
 */
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

  const removeLinkedWallet = async (linkedWalletAddress: string) => {
    const sequenceWaas: SequenceWaaS | undefined = (connector as any)?.sequenceWaas

    try {
      setLoading(true)
      setError(null)

      const parentWalletAddress = await sequenceWaas?.getAddress()
      if (!parentWalletAddress) {
        throw new Error('Failed to fetch WaaS address')
      }

      const parentWalletMessage = 'Remove linked wallet with address: ' + linkedWalletAddress
      const parentWalletSignature = await sequenceWaas?.signMessage({
        message: parentWalletMessage,
        network: CHAIN_ID_FOR_SIGNATURE
      })

      if (!parentWalletSignature) {
        throw new Error('Failed to sign message')
      }

      await apiClient.removeLinkedWallet({
        parentWalletAddress,
        parentWalletMessage,
        parentWalletSignature: parentWalletSignature.data.signature,
        linkedWalletAddress,
        signatureChainId: String(CHAIN_ID_FOR_SIGNATURE)
      })
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return {
    linkWallet,
    removeLinkedWallet,
    loading,
    error
  }
}
