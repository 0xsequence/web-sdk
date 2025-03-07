import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Spinner, Text } from '@0xsequence/design-system'

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
    <Box flexDirection="column" alignItems="center" justifyContent="center" style={{ minHeight: '100vh' }}>
      <Spinner size="lg" />
      <Text marginTop="4">Processing Immutable login...</Text>
    </Box>
  )
}
