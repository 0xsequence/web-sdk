'use client'

import { Box, Image, Button } from '@0xsequence/design-system'
import { useOpenConnectModal } from '@0xsequence/kit'
import { useAccount } from 'wagmi'

import { Connected } from './components/Connected'
import { Footer } from './components/Footer'

export default function Home() {
  const { isConnected } = useAccount()
  const { setOpenConnectModal } = useOpenConnectModal()

  return (
    <main>
      {!isConnected ? (
        <Box flexDirection="column" alignItems="center" justifyContent="center" gap="5" height="vh">
          <Box background="white" padding="2" borderRadius="sm">
            <Image alt="Next" src="next.svg" height="3" disableAnimation />
          </Box>
          <Box flexDirection="row" alignItems="center" justifyContent="center" gap="3">
            <Image alt="Sequence Kit Logo" style={{ width: '48px' }} src="kit-logo.svg" disableAnimation />
            <Image
              alt="Sequence Kit Text Logo"
              style={{
                width: '32px'
                // filter: theme === 'dark' ? 'invert(0)' : 'invert(1)'
              }}
              src="kit-logo-text.svg"
              disableAnimation
            />
          </Box>

          <Box gap="2" flexDirection="row" alignItems="center">
            <Button onClick={() => setOpenConnectModal(true)} variant="feature" label="Connect" />
          </Box>
        </Box>
      ) : (
        <Connected />
      )}

      <Footer />
    </main>
  )
}
