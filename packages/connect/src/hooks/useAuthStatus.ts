'use client'

import { useEffect, useState } from 'react'

import { checkAuthStatus } from '../utils/checkAuthStatus.js'

export interface UseAuthStatusOptions {
  /**
   * Whether to automatically check auth status on mount and when walletUrl changes
   * @default true
   */
  enabled?: boolean
  /**
   * Interval in milliseconds to refetch auth status
   * If not provided, will only check once on mount and when walletUrl changes
   */
  refetchInterval?: number
}

export interface UseAuthStatusResult {
  /**
   * Whether the user is logged in according to the auth status endpoint
   */
  isV3WalletSignedIn: boolean | null
  /**
   * Whether the auth status check is currently in progress
   */
  isLoading: boolean
  /**
   * Error that occurred during the auth status check, if any
   */
  error: Error | null
  /**
   * Manually refetch the auth status
   */
  refetch: () => Promise<void>
}

/**
 * Hook to check if the user is logged in by calling the auth status endpoint
 *
 * This hook calls `${walletUrl}/api/auth/status.js` to determine if the user
 * is currently logged in. Useful for v3 connectors to check authentication state.
 *
 * @param walletUrl - The wallet URL to check auth status against
 * @param options - Optional configuration for the hook
 * @returns Object containing login status, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { isV3WalletSignedIn, isLoading } = useAuthStatus('https://wallet.sequence.app')
 *
 * if (isLoading) {
 *   return <div>Checking auth status...</div>
 * }
 *
 * if (isV3WalletSignedIn) {
 *   return <div>User is logged in</div>
 * }
 * ```
 */
export const useAuthStatus = (walletUrl: string | undefined | null, options: UseAuthStatusOptions = {}): UseAuthStatusResult => {
  const { enabled = true, refetchInterval } = options

  const [isV3WalletSignedIn, setIsV3WalletSignedIn] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const checkStatus = async () => {
    if (!walletUrl || !enabled) {
      setIsV3WalletSignedIn(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const signedIn = await checkAuthStatus(walletUrl)
      setIsV3WalletSignedIn(signedIn)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check auth status')
      setError(error)
      setIsV3WalletSignedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!enabled || !walletUrl) {
      return
    }

    checkStatus()

    let intervalId: ReturnType<typeof setInterval> | undefined
    if (refetchInterval && refetchInterval > 0) {
      intervalId = setInterval(checkStatus, refetchInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [walletUrl, enabled, refetchInterval])

  return {
    isV3WalletSignedIn,
    isLoading,
    error,
    refetch: checkStatus
  }
}
