import { Box, Card, EmailIcon, Tooltip, useTheme } from '@0xsequence/design-system'
import { GoogleLogin } from '@react-oauth/google'
import { useEffect, useState } from 'react'
import { appleAuthHelpers } from 'react-apple-signin-auth'

import { LocalStorageKey } from '../../constants'
import { useStorage, useStorageItem } from '../../hooks/useStorage'
import { ExtendedConnector, WalletProperties } from '../../types'

const BUTTON_SIZE = '14'
const ICON_SIZE = '10'

const getLogo = (theme: any, walletProps: WalletProperties) =>
  theme === 'dark'
    ? walletProps.logoDark || walletProps.monochromeLogoDark
    : walletProps.logoLight || walletProps.monochromeLogoLight

interface ConnectButtonProps {
  connector: ExtendedConnector
  label?: string
  onConnect: (connector: ExtendedConnector) => void
}

export const ConnectButton = (props: ConnectButtonProps) => {
  const { connector, label, onConnect } = props
  const { theme } = useTheme()
  const walletProps = connector._wallet

  const Logo = getLogo(theme, walletProps)

  return (
    <Tooltip message={label || walletProps.name}>
      <Card
        clickable
        width={BUTTON_SIZE}
        height={BUTTON_SIZE}
        padding="2"
        borderRadius="xs"
        justifyContent="center"
        alignItems="center"
        onClick={() => onConnect(connector)}
      >
        <Box as={Logo} width={ICON_SIZE} height={ICON_SIZE} />
      </Card>
    </Tooltip>
  )
}

export const GoogleWaasConnectButton = (props: ConnectButtonProps) => {
  const { connector, onConnect } = props
  const storage = useStorage()

  const [enableGoogleTooltip, setEnableGoogleTooltip] = useState(false)
  const { theme } = useTheme()
  const walletProps = connector._wallet

  const Logo = getLogo(theme, walletProps)

  useEffect(() => {
    setTimeout(() => {
      setEnableGoogleTooltip(true)
    }, 300)
  })

  return (
    <Tooltip message="Google" disabled={!enableGoogleTooltip}>
      <Card
        clickable
        background="transparent"
        borderRadius="xs"
        padding="0"
        width={BUTTON_SIZE}
        height={BUTTON_SIZE}
        position="relative"
      >
        <Box
          width="full"
          height="full"
          overflow="hidden"
          borderRadius="sm"
          alignItems="center"
          justifyContent="center"
          style={{ opacity: 0.0000001, transform: 'scale(1.4)' }}
        >
          <GoogleLogin
            type="icon"
            size="large"
            width="56"
            onSuccess={credentialResponse => {
              if (credentialResponse.credential) {
                storage?.setItem(LocalStorageKey.WaasGoogleIdToken, credentialResponse.credential)
                onConnect(connector)
              }
            }}
            onError={() => {
              console.log('Login Failed')
            }}
          />
        </Box>
        <Box
          background="backgroundSecondary"
          borderRadius="xs"
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="absolute"
          pointerEvents="none"
          width="full"
          height="full"
          top="0"
          right="0"
        >
          <Box as={Logo} width={ICON_SIZE} height={ICON_SIZE} />
        </Box>
      </Card>
    </Tooltip>
  )
}

export const AppleWaasConnectButton = (props: ConnectButtonProps) => {
  const { connector, onConnect } = props
  const storage = useStorage()

  const { data: appleClientId } = useStorageItem(LocalStorageKey.WaasAppleClientID)
  const { data: appleRedirectUri } = useStorageItem(LocalStorageKey.WaasAppleRedirectURI)

  return appleClientId && appleRedirectUri ? (
    <ConnectButton
      connector={connector}
      onConnect={() => {
        appleAuthHelpers.signIn({
          authOptions: {
            clientId: appleClientId,
            redirectURI: appleRedirectUri,
            scope: 'openid email',
            usePopup: true
          },
          onSuccess: (response: any) => {
            if (response.authorization?.id_token) {
              storage?.setItem(LocalStorageKey.WaasAppleIdToken, response.authorization.id_token)
              onConnect(connector)
            } else {
              console.log('Apple login error: No id_token found')
            }
          },
          onError: (error: any) => console.error(error)
        })
      }}
    />
  ) : null
}

interface EmailConnectButtonProps {
  onClick: () => void
}

export const EmailConnectButton = (props: EmailConnectButtonProps) => {
  const { onClick } = props

  return (
    <Tooltip message={'Email'}>
      <Card
        clickable
        width={BUTTON_SIZE}
        height={BUTTON_SIZE}
        padding="2"
        borderRadius="xs"
        justifyContent="center"
        alignItems="center"
        onClick={onClick}
      >
        <EmailIcon size="xl" color="text100" />
      </Card>
    </Tooltip>
  )
}
