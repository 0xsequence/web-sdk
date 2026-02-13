import { useOpenConnectModal, useWallets } from '@0xsequence/connect'
import { Button, Image } from '@0xsequence/design-system'
import { Footer } from 'example-shared-components'
import { Link } from 'react-router-dom'

import { Connected } from './Connected'

export const Homepage = () => {
  const { wallets } = useWallets()
  const { setOpenConnectModal } = useOpenConnectModal()

  const onClickConnect = () => {
    setOpenConnectModal(true)
  }

  return (
    <main>
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 h-screen">
          <div className="flex flex-row items-center justify-center gap-3">
            <Image className="w-[300px]" src="images/sequence-websdk-dark.svg" />
          </div>

          <div className="flex gap-2 flex-row items-center">
            <Button onClick={onClickConnect} variant="feature" label="Connect" />
            <Link to="/inline">
              <Button variant="primary" label="Inline Demo" />
            </Link>
          </div>
        </div>
      ) : (
        <Connected />
      )}
      <Footer />
    </main>
  )
}
