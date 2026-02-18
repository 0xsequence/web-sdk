import { Spinner, Text } from '@0xsequence/design-system'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { passportInstance } from '../config'

export function ImmutableCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await passportInstance.loginCallback()
        navigate('/')
      } catch (error) {
        console.error('Immutable login callback failed:', error)
        navigate('/')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Spinner size="lg" />
      <Text className="mt-4">Processing Immutable login...</Text>
    </div>
  )
}
