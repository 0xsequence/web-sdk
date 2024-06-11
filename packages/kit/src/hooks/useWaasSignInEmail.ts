'use client'

import { useEffect, useState } from 'react'
import { useConfig, useAccount } from 'wagmi'

import { LocalStorageKey } from '../constants/localStorage'

export const useWaasSignInEmail = () => {
  const { storage } = useConfig()
  const { isConnected } = useAccount()
  const [email, setEmail] = useState<null|string>(null)


  const storeEmail = async () => {
    const key = LocalStorageKey.WaasSignInEmail
    const storedEmail = await storage?.getItem(key as any)
  
    setEmail(storedEmail)
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

