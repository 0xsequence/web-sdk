'use client'

import { useEffect, useState } from 'react'
import { useConfig, useAccount } from 'wagmi'

import { LocalStorageKey } from '../constants/localStorage'

/**
 * Hook to retrieve the email address associated with the currently connected wallet.
 *
 * This hook monitors the connection status and retrieves the stored email address when a wallet
 * is connected. It works with both WaaS (Wallet-as-a-Service) and universal wallet types.
 * The email is cleared when the wallet is disconnected.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useSignInEmail} for more detailed documentation.
 *
 * @returns {string | null} The email address of the connected wallet user, or null if not connected
 * or no email is associated
 *
 * @example
 * ```tsx
 * const email = useSignInEmail()
 * if (email) {
 *   console.log('Connected user email:', email)
 * }
 * ```
 */
export const useSignInEmail = () => {
  const { storage } = useConfig()
  const { isConnected } = useAccount()
  const [email, setEmail] = useState<null | string>(null)

  const storeEmail = async () => {
    const storedEmail = await storage?.getItem(LocalStorageKey.WaasSignInEmail)

    setEmail(storedEmail as string)
  }

  useEffect(() => {
    if (isConnected) {
      storeEmail()
    } else {
      setEmail(null)
    }
  }, [isConnected])

  return email
}
