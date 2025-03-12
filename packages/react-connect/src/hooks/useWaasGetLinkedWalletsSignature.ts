'use client'

import { SequenceWaaS } from '@0xsequence/waas'
import { useState, useEffect } from 'react'
import { Address } from 'viem'
import { Connector } from 'wagmi'

import { CHAIN_ID_FOR_SIGNATURE } from '../constants/walletLinking'

interface UseWaasSignatureForLinkingResult {
  message: string | undefined
  signature: string | undefined
  address: string | undefined
  chainId: number
  loading: boolean
  error: Error | null
}

const WAAS_SIGNATURE_PREFIX = '@0xsequence.waas_signature-'
const getSignatureKey = (address: string) => `${WAAS_SIGNATURE_PREFIX}${address}`

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
