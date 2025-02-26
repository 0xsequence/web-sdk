'use client'

import { useAccount } from 'wagmi'

import { Connected } from './components/Connected'

import { Box, Button, Image } from '@0xsequence/design-system'
import { useKitWallets, useOpenConnectModal } from '@0xsequence/kit'
import { Footer } from '@0xsequence/kit-example-shared-components'

export default function Home() {
  const { wallets } = useKitWallets()
  const { setOpenConnectModal } = useOpenConnectModal()

  return (
    <main>
      {wallets.length === 0 ? (
        <Box flexDirection="column" alignItems="center" justifyContent="center" gap="5" height="vh">
          <Box background="white" padding="2" borderRadius="sm">
            <Image alt="Next" src="images/next.svg" height="3" disableAnimation />
          </Box>
          <Box flexDirection="row" alignItems="center" justifyContent="center" gap="3">
            <Image alt="Sequence Kit Logo" style={{ width: '48px' }} src="images/kit-logo.svg" disableAnimation />
            <Image
              alt="Sequence Kit Text Logo"
              style={{
                width: '32px'
                // filter: theme === 'dark' ? 'invert(0)' : 'invert(1)'
              }}
              src="images/kit-logo-text.svg"
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
