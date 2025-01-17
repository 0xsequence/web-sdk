import { Box, Card, Text, Tooltip, useTheme } from '@0xsequence/design-system'
import { useGoogleLogin } from '@react-oauth/google'
import { useEffect, useRef, useState } from 'react'
import { appleAuthHelpers } from 'react-apple-signin-auth'

import { LocalStorageKey } from '../../constants'
import { useStorage, useStorageItem } from '../../hooks/useStorage'
import { ExtendedConnector, WalletProperties } from '../../types'

const BUTTON_HEIGHT = '52px'
const BUTTON_HEIGHT_FULL_WIDTH = '44px'
const ICON_SIZE = '8'

const getLogo = (theme: any, walletProps: WalletProperties) =>
  theme === 'dark'
    ? walletProps.logoDark || walletProps.monochromeLogoDark
    : walletProps.logoLight || walletProps.monochromeLogoLight

interface ConnectButtonProps {
  connector: ExtendedConnector
  label?: string
  onConnect: (connector: ExtendedConnector) => void
  isDescriptive?: boolean
}

export const ConnectButton = (props: ConnectButtonProps) => {
  const { connector, label, onConnect } = props
  const { theme } = useTheme()
  const walletProps = connector._wallet
  const isDescriptive = props.isDescriptive || false

  const Logo = getLogo(theme, walletProps)

  console.log('isDescriptive', props)

  if (isDescriptive) {
    return (
      <Tooltip message={label || walletProps.name}>
        <Card
          clickable
          borderRadius="xs"
          justifyContent="center"
          alignItems="center"
          onClick={() => onConnect(connector)}
          width="full"
          style={{ height: BUTTON_HEIGHT_FULL_WIDTH }}
        >
          <Box as={Logo} width={ICON_SIZE} height={ICON_SIZE} />
          <Text>Continue with label</Text>
        </Card>
      </Tooltip>
    )
  }

  return (
    <Tooltip message={label || walletProps.name}>
      <Card
        clickable
        borderRadius="xs"
        justifyContent="center"
        alignItems="center"
        onClick={() => onConnect(connector)}
        width="full"
        style={{
          height: BUTTON_HEIGHT
        }}
      >
        <Box as={Logo} width={ICON_SIZE} height={ICON_SIZE} />
      </Card>
    </Tooltip>
  )
}

export const GoogleWaasConnectButton = (props: ConnectButtonProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const { connector, onConnect } = props
  const storage = useStorage()

  const login = useGoogleLogin({
    onSuccess: async response => {
      // TODO: GET CREDENTIALS FROM BACKEND USING TOKENS
      //https://github.com/MomenSherif/react-oauth/issues/12
      const tokens = await fetch('http://localhost:3001/auth/google', {
        method: 'POST',
        body: JSON.stringify({ code: response.code })
      })
      // GET CREDENTIALS FROM BACKEND USING TOKENS
      const credential = ''
      storage?.setItem(LocalStorageKey.WaasGoogleIdToken, credential)
      onConnect(connector)

      console.log(tokens)
    },
    onError: () => {
      console.log('Login Failed')
    },
    flow: 'auth-code'
  })

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
    <ConnectButton
      {...props}
      connector={connector}
      onConnect={() => {
        login()
      }}
    />
  )
}

export const AppleWaasConnectButton = (props: ConnectButtonProps) => {
  const { connector, onConnect } = props
  const storage = useStorage()

  const { data: appleClientId } = useStorageItem(LocalStorageKey.WaasAppleClientID)
  const { data: appleRedirectUri } = useStorageItem(LocalStorageKey.WaasAppleRedirectURI)

  return appleClientId && appleRedirectUri ? (
    <ConnectButton
      {...props}
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
