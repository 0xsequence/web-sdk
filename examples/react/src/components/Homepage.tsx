import { Button, Card, Text, Image, useTheme, CheckmarkIcon } from '@0xsequence/design-system'
import { useKitWallets, useOpenConnectModal, WalletType } from '@0xsequence/kit'
import { Footer } from '@0xsequence/kit-example-shared-components'
import { clsx } from 'clsx'

import { Connected } from './Connected'

// append ?debug to url to enable debug mode
const searchParams = new URLSearchParams(location.search)
const walletType: WalletType = searchParams.get('type') === 'universal' ? 'universal' : 'waas'

export const Homepage = () => {
  const { theme } = useTheme()

  const { wallets } = useKitWallets()
  const { setOpenConnectModal } = useOpenConnectModal()

  const handleSwitchWalletType = (type: WalletType) => {
    const searchParams = new URLSearchParams()

    searchParams.set('type', type)
    window.location.search = searchParams.toString()
  }

  const onClickConnect = () => {
    setOpenConnectModal(true)
  }

  return (
    <main>
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 h-screen">
          <div className="flex flex-row items-center justify-center gap-3">
            <Image className="w-12" src="images/kit-logo.svg" />
            <Image
              className="w-8"
              src="images/kit-logo-text.svg"
              style={{ filter: theme === 'dark' ? 'invert(0)' : 'invert(1)' }}
            />
          </div>

          <div className="flex gap-2 flex-row items-center">
            <Button onClick={onClickConnect} variant="feature" label="Connect" />
          </div>

          <div className="flex gap-2 flex-col px-4 mt-10 w-full max-w-[480px]">
            <WalletTypeSelect
              type="waas"
              title="Embedded Wallet (WaaS)"
              description="Connect to an embedded wallet for a seamless experience."
              onClick={handleSwitchWalletType}
            />

            <WalletTypeSelect
              type="universal"
              title="Universal Wallet"
              description="Connect to the universal sequence wallet or EIP6963 Injected wallet providers (web extension wallets)."
              onClick={handleSwitchWalletType}
            />
          </div>
        </div>
      ) : (
        <Connected />
      )}
      <Footer />
    </main>
  )
}

interface WalletTypeSelectProps {
  type: WalletType
  title: string
  description: string
  onClick: (type: WalletType) => void
}

const WalletTypeSelect = (props: WalletTypeSelectProps) => {
  const { type, title, description, onClick } = props

  const isSelected = walletType === type

  return (
    <Card
      className={clsx('w-full border-2', isSelected && 'border-[rgb(127,59,200)] shadow-[0_0_24px_rgb(127_59_158_/_0.8)]')}
      clickable
      outlined
      onClick={() => onClick(type)}
    >
      <div className="flex gap-2">
        <div>
          <Text variant="normal" fontWeight="bold" color={isSelected ? 'primary' : 'secondary'}>
            {title}
          </Text>
          <Text className="mt-2" variant="normal" color="muted" asChild>
            <div>{description}</div>
          </Text>
        </div>
        <CheckmarkIcon className={clsx('text-[rgb(127_59_200)]', !isSelected && 'hidden')} size="md" />
      </div>
    </Card>
  )
}
