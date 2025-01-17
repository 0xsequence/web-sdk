import { SequenceWaaS } from '@0xsequence/waas'
import { useState, useEffect } from 'react'
import { Connector } from 'wagmi'

interface UseWaasSignatureForLinkingResult {
  message: string | undefined
  signature: string | undefined
  address: string | undefined
  chainId: number
  loading: boolean
  error: Error | null
}

// Chain doesn't matter for linking, we can just hardcode a common one
const CHAIN_ID_FOR_SIGNATURE = 137

const getSignatureKey = (address: string) => `waas-signature-${address}`

export const useWaasSignatureForLinking = (connector: Connector | undefined): UseWaasSignatureForLinkingResult => {
  const [result, setResult] = useState<UseWaasSignatureForLinkingResult>({
    message: undefined,
    signature: undefined,
    address: undefined,
    chainId: CHAIN_ID_FOR_SIGNATURE,
    loading: false,
    error: null
  })

  const sequenceWaas: SequenceWaaS | undefined = (connector as any).sequenceWaas
  if (!sequenceWaas) {
    throw new Error('Connector does not support SequenceWaaS')
  }

  const [address, setAddress] = useState<string | undefined>(undefined)

  // Fetch address
  useEffect(() => {
    if (!connector) {
      setAddress(undefined)
      return
    }

    const fetchAddress = async () => {
      try {
        const newAddress = await sequenceWaas.getAddress()
        setAddress(newAddress)
      } catch (error) {
        console.error('Failed to fetch WaaS address:', error)
        setAddress(undefined)
      }
    }

    fetchAddress()
  }, [connector])

  // Clear other cached signatures when account changes
  useEffect(() => {
    if (address) {
      // Clean up signatures from other addresses
      Object.keys(localStorage)
        .filter(key => key.startsWith(getSignatureKey('')) && key !== getSignatureKey(address))
        .forEach(key => localStorage.removeItem(key))
    }
  }, [address])

  // Check localStorage and generate signature if needed
  useEffect(() => {
    if (!connector || !address) {
      return
    }

    // Try to get cached signature from localStorage
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

    const getSignature = async () => {
      try {
        setResult(prev => ({ ...prev, loading: true, error: null }))

        const message = `parent wallet with address ${address}`
        const signedMessage = await sequenceWaas.signMessage({
          message,
          network: CHAIN_ID_FOR_SIGNATURE
        })

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
