import { Card, ContextMenuIcon, Text, Tooltip, useTheme } from '@0xsequence/design-system'

import type { ExtendedConnector, WalletProperties } from '../../types.js'

const BUTTON_HEIGHT = '52px'
const BUTTON_HEIGHT_DESCRIPTIVE = '44px'
const iconSizeClasses = 'w-8 h-8'
const iconDescriptiveSizeClasses = 'w-6 h-6'

export const getLogo = (theme: any, walletProps: WalletProperties) =>
  theme === 'dark'
    ? walletProps.logoDark || walletProps.monochromeLogoDark
    : walletProps.logoLight || walletProps.monochromeLogoLight

interface ConnectButtonProps {
  connector: ExtendedConnector
  label?: string
  onConnect: (connector: ExtendedConnector) => void
  isDescriptive?: boolean
  disableTooltip?: boolean
}

export const ConnectButton = (props: ConnectButtonProps) => {
  const { connector, label, disableTooltip, onConnect } = props
  const { theme } = useTheme()
  const walletProps = connector._wallet
  const isDescriptive = props.isDescriptive || false
  const shouldRenderTextButton = isDescriptive || !!walletProps.ctaText
  const buttonCopy = walletProps.ctaText || `Continue with ${label || walletProps.name}`.trim()

  const Logo = getLogo(theme, walletProps)

  if (shouldRenderTextButton) {
    return (
      <Tooltip message={label || walletProps.name} side="bottom" disabled={disableTooltip}>
        <Card
          className={`flex gap-3 items-center w-full ${isDescriptive ? 'justify-start' : 'justify-center'}`}
          clickable
          onClick={() => onConnect(connector)}
          style={{ height: BUTTON_HEIGHT_DESCRIPTIVE }}
        >
          <Logo className={iconDescriptiveSizeClasses} />
          <Text color="primary" variant="normal" fontWeight="bold">
            {buttonCopy}
          </Text>
        </Card>
      </Tooltip>
    )
  }

  return (
    <Tooltip message={label || walletProps.name} disabled={disableTooltip}>
      <Card
        className="flex justify-center items-center w-full"
        clickable
        onClick={() => onConnect(connector)}
        style={{
          height: BUTTON_HEIGHT
        }}
      >
        <Logo className={iconSizeClasses} />
      </Card>
    </Tooltip>
  )
}

interface ShowAllWalletsButtonProps {
  onClick: () => void
}

export const ShowAllWalletsButton = ({ onClick }: ShowAllWalletsButtonProps) => {
  return (
    <Tooltip message="Show more">
      <Card
        className="flex justify-center items-center w-full"
        clickable
        onClick={onClick}
        style={{
          height: BUTTON_HEIGHT
        }}
      >
        <ContextMenuIcon className="text-primary" size="xl" />
      </Card>
    </Tooltip>
  )
}
