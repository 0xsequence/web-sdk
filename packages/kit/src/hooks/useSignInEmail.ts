'use client'

import { useEffect, useState } from 'react'
import { useConfig, useAccount } from 'wagmi'

import { LocalStorageKey } from '../constants/localStorage'

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
