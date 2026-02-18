'use client'

import { Spinner, Text } from '@0xsequence/design-system'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { getPassportInstance } from '../config'

export function ImmutableCallback() {
  const router = useRouter()

  useEffect(() => {
    const passport = getPassportInstance()

    if (!passport) {
      return
    }

    const handleCallback = async () => {
      try {
        await passport.loginCallback()
        router.replace('/')
      } catch (error) {
        console.error('Immutable login callback failed:', error)
        router.replace('/')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Spinner size="lg" />
      <Text className="mt-4">Processing Immutable login...</Text>
    </div>
  )
}
