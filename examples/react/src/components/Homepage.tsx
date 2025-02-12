import { Button, Card, Text, Image, useTheme, CheckmarkIcon, breakpoints } from '@0xsequence/design-system'
import { useKitWallets, useOpenConnectModal, WalletType } from '@0xsequence/kit'
import { Footer } from '@0xsequence/kit-example-shared-components'
import { useConnections } from 'wagmi'

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
            <Image style={{ width: '48px' }} src="images/kit-logo.svg" />
            <Image
              style={{
                width: '32px',
                filter: theme === 'dark' ? 'invert(0)' : 'invert(1)'
              }}
              src="images/kit-logo-text.svg"
            />
          </div>

          <div className="flex gap-2 flex-row items-center">
            <Button onClick={onClickConnect} variant="feature" label="Connect" />
          </div>

          <div className="flex gap-2 flex-col px-4 mt-10 w-full" style={{ maxWidth: breakpoints.md }}>
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
      className="w-full border-2"
      clickable
      outlined
      style={{
        boxShadow: isSelected ? '0 0 24px rgb(127 59 158 / 0.8)' : 'none',
        borderColor: isSelected ? 'rgb(127 59 200)' : 'var(--seq-colors-border-normal)'
      }}
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
        <CheckmarkIcon size="md" style={{ color: 'rgb(127 59 200)' }} visibility={isSelected ? 'visible' : 'hidden'} />
      </div>
    </Card>
  )
}
