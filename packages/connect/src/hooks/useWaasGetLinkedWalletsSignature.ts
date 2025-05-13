'use client'

import { SequenceWaaS } from '@0xsequence/waas'
import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import type { Connector } from 'wagmi'

import { CHAIN_ID_FOR_SIGNATURE } from '../constants/walletLinking.js'

/**
 * Result object returned by the useWaasGetLinkedWalletsSignature hook.
 * Contains all necessary information about the signature for wallet linking.
 */
interface UseWaasSignatureForLinkingResult {
  /** The message that was signed */
  message: string | undefined
  /** The signature of the message */
  signature: string | undefined
  /** The address that signed the message */
  address: string | undefined
  /** The chain ID used for signing */
  chainId: number
  /** Whether the signature is currently being generated */
  loading: boolean
  /** Any error that occurred during signature generation */
  error: Error | null
}

const WAAS_SIGNATURE_PREFIX = '@0xsequence.waas_signature-'
const getSignatureKey = (address: string) => `${WAAS_SIGNATURE_PREFIX}${address}`

/**
 * Hook to manage signatures required for linking wallets in a WaaS (Wallet-as-a-Service) context.
 *
 * This hook handles the generation and caching of signatures that are used to prove ownership
 * of a parent wallet when linking child wallets. The signatures are cached in localStorage
 * for 24 hours to avoid unnecessary re-signing.
 *
 * Features:
 * - Automatic signature generation when needed
 * - 24-hour signature caching in localStorage
 * - Automatic cleanup of old signatures
 * - Error handling for signature generation
 *
 * @param connection - The current wallet connection object containing:
 *   - accounts: Array of connected addresses (uses the first one)
 *   - chainId: The current chain ID
 *   - connector: The wallet connector instance
 *
 * @returns An object containing:
 * - `message` - The message that was signed
 * - `signature` - The generated signature
 * - `address` - The address that signed the message
 * - `chainId` - The chain ID used for signing
 * - `loading` - Whether signature generation is in progress
 * - `error` - Any error that occurred during the process
 *
 * @example
 * ```tsx
 * const {
 *   message,
 *   signature,
 *   address,
 *   loading,
 *   error
 * } = useWaasGetLinkedWalletsSignature(waasConnection)
 *
 * if (loading) {
 *   return <div>Generating signature...</div>
 * }
 *
 * if (error) {
 *   return <div>Error: {error.message}</div>
 * }
 *
 * if (signature) {
 *   // Use the signature for wallet linking
 *   console.log(`Got signature from ${address} for message: ${message}`)
 * }
 * ```
 */
export const useWaasGetLinkedWalletsSignature = (
  connection:
    | {
        accounts: readonly [Address, ...Address[]]
        chainId: number
        connector: Connector
      }
    | undefined
): UseWaasSignatureForLinkingResult => {
  const sequenceWaas: SequenceWaaS | undefined = (connection as any)?.connector?.sequenceWaas
  const address = connection?.accounts[0]

  // Try to get cached signature during initial state setup
  const initialState = (): UseWaasSignatureForLinkingResult => {
    if (address) {
      const cached = localStorage.getItem(getSignatureKey(address))
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          const timestamp = parsed.timestamp || 0
          const age = Date.now() - timestamp
          const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

          if (age < MAX_AGE) {
            return {
              message: parsed.message,
              signature: parsed.signature,
              address: parsed.address,
              chainId: CHAIN_ID_FOR_SIGNATURE,
              loading: false,
              error: null
            }
          }
          localStorage.removeItem(getSignatureKey(address))
        } catch (e) {
          localStorage.removeItem(getSignatureKey(address))
        }
      }
    }

    return {
      message: undefined,
      signature: undefined,
      address: address,
      chainId: CHAIN_ID_FOR_SIGNATURE,
      loading: false,
      error: null
    }
  }

  const [result, setResult] = useState<UseWaasSignatureForLinkingResult>(initialState)

  useEffect(() => {
    if (!sequenceWaas) {
      return
    }
    if (!address) {
      return
    }

    // Clean up signatures from other addresses
    Object.keys(localStorage)
      .filter(key => key.startsWith(WAAS_SIGNATURE_PREFIX) && key !== getSignatureKey(address))
      .forEach(key => localStorage.removeItem(key))

    // Try to get cached signature for current address
    const cached = localStorage.getItem(getSignatureKey(address))
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        const timestamp = parsed.timestamp || 0
        const age = Date.now() - timestamp
        const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

        if (age < MAX_AGE) {
          setResult({
            message: parsed.message,
            signature: parsed.signature,
            address: parsed.address,
            chainId: CHAIN_ID_FOR_SIGNATURE,
            loading: false,
            error: null
          })
          return
        } else {
          localStorage.removeItem(getSignatureKey(address))
        }
      } catch (e) {
        localStorage.removeItem(getSignatureKey(address))
      }
    }

    // Generate new signature if no valid cached one exists
    const getSignature = async () => {
      try {
        setResult(prev => ({ ...prev, loading: true, error: null }))

        const message = `parent wallet with address ${address}`
        const signedMessage = await sequenceWaas?.signMessage({
          message,
          network: CHAIN_ID_FOR_SIGNATURE
        })

        if (!signedMessage) {
          throw new Error('Failed to sign message')
        }

        const newResult = {
          message,
          signature: signedMessage.data.signature,
          address,
          chainId: CHAIN_ID_FOR_SIGNATURE,
          loading: false,
          error: null
        }

        // Cache the signature in localStorage with timestamp
        localStorage.setItem(
          getSignatureKey(address),
          JSON.stringify({
            message,
            signature: signedMessage.data.signature,
            address,
            timestamp: Date.now()
          })
        )

        setResult(newResult)
      } catch (error) {
        setResult({
          message: undefined,
          signature: undefined,
          address: undefined,
          chainId: CHAIN_ID_FOR_SIGNATURE,
          loading: false,
          error: error as Error
        })
      }
    }

    getSignature()
  }, [address]) // Only regenerate when address changes

  return result
}
