import { useOpenConnectModal, useWallets } from '@0xsequence/connect'
import { Button, Image, Switch, Text, useTheme } from '@0xsequence/design-system'
import { Footer } from 'example-shared-components'
import { Link } from 'react-router-dom'

import { Connected } from './Connected'

interface HomepageProps {
  useFullWidthSocials: boolean
  onUseFullWidthSocialsChange: (useFullWidthSocials: boolean) => void
}

export const Homepage = ({ useFullWidthSocials, onUseFullWidthSocialsChange }: HomepageProps) => {
  const { wallets } = useWallets()
  const { setOpenConnectModal } = useOpenConnectModal()
  const { theme } = useTheme()

  const onClickConnect = () => {
    setOpenConnectModal(true)
  }

  return (
    <main>
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 h-screen">
          <div className="flex flex-row items-center justify-center gap-3">
            <Image
              className="w-[300px]"
              src={theme === 'dark' ? 'images/sequence-websdk-dark.svg' : 'images/sequence-websdk-light.svg'}
            />
          </div>

          <div className="flex gap-2 flex-row items-center">
            <Button onClick={onClickConnect} variant="primary">
              Connect
            </Button>
            <Link to="/inline">
              <Button variant="primary">Inline Demo</Button>
            </Link>
          </div>

          <label className="flex items-center gap-3">
            <Text variant="small" color={useFullWidthSocials ? 'muted' : 'primary'}>
              Compact
            </Text>
            <Switch
              name="social-button-layout"
              size="sm"
              checked={useFullWidthSocials}
              onCheckedChange={onUseFullWidthSocialsChange}
              aria-label="Use full width social buttons"
            />
            <Text variant="small" color={useFullWidthSocials ? 'primary' : 'muted'}>
              Full width
            </Text>
          </label>
        </div>
      ) : (
        <Connected />
      )}
      <Footer />
    </main>
  )
}
