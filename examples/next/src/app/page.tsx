'use client'

import { useWallets, useOpenConnectModal } from '@0xsequence/connect'
import { Image, Button } from '@0xsequence/design-system'
import { Footer } from 'example-shared-components'

import { Connected } from './components/Connected'

export default function Home() {
  const { wallets } = useWallets()
  const { setOpenConnectModal } = useOpenConnectModal()

  return (
    <main>
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 h-screen">
          <div className="bg-white p-2 rounded-lg">
            <Image className="h-3" alt="Next" src="images/next.svg" disableAnimation />
          </div>
          <div className="flex flex-row items-center justify-center gap-3">
            <Image alt="Sequence Web SDK Logo" src="images/sequence-websdk-dark.svg" disableAnimation />
          </div>

          <div className="flex gap-2 flex-row items-center">
            <Button onClick={() => setOpenConnectModal(true)} variant="feature" label="Connect" />
          </div>
        </div>
      ) : (
        <Connected />
      )}
      <Footer />
    </main>
  )
}
