import { Card, ContextMenuIcon, Text, Tooltip, useTheme } from '@0xsequence/design-system'
import { GoogleLogin } from '@react-oauth/google'
import { useEffect, useState } from 'react'
import { appleAuthHelpers } from 'react-apple-signin-auth'

import { getXIdToken } from '../../connectors/X/XAuth.js'
import { LocalStorageKey } from '../../constants/localStorage.js'
import { useStorage, useStorageItem } from '../../hooks/useStorage.js'
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

  const Logo = getLogo(theme, walletProps)

  if (isDescriptive) {
    return (
      <Tooltip message={label || walletProps.name} side="bottom" disabled={disableTooltip}>
        <Card
          className="flex gap-3 justify-center items-center w-full"
          clickable
          onClick={() => onConnect(connector)}
          style={{ height: BUTTON_HEIGHT_DESCRIPTIVE }}
        >
          <Logo className={iconDescriptiveSizeClasses} />
          <Text color="primary" variant="normal" fontWeight="bold">
            Continue with {label || walletProps.name}
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

export const GuestWaasConnectButton = (props: ConnectButtonProps & { setIsLoading: (isLoading: boolean) => void }) => {
  const { connector, onConnect, setIsLoading } = props

  return (
    <ConnectButton
      {...props}
      connector={connector}
      onConnect={() => {
        setIsLoading(true)
        onConnect(connector)
      }}
      disableTooltip
    />
  )
}

export const GoogleWaasConnectButton = (props: ConnectButtonProps) => {
  const { connector, onConnect, isDescriptive = false } = props
  const storage = useStorage()

  const { theme } = useTheme()
  const walletProps = connector._wallet

  const Logo = getLogo(theme, walletProps)

  const WaasLoginContent = () => {
    if (isDescriptive) {
      return (
        <div className="flex gap-1 justify-center items-center bg-background-secondary absolute pointer-events-none w-full h-full top-0 right-0">
          <Logo className={iconDescriptiveSizeClasses} />
          <Text color="primary" variant="normal" fontWeight="bold">
            Continue with Google
          </Text>
        </div>
      )
    }

    return (
      <div className="flex bg-background-secondary justify-center items-center absolute pointer-events-none w-full h-full top-0 right-0">
        <Logo className={iconSizeClasses} />
      </div>
    )
  }

  const buttonHeight = isDescriptive ? BUTTON_HEIGHT_DESCRIPTIVE : BUTTON_HEIGHT

  return (
    <Tooltip message="Google" disabled>
      <Card
        className="bg-transparent p-0 w-full relative"
        clickable
        style={{
          height: buttonHeight
        }}
      >
        <div
          className="flex flex-row h-full overflow-hidden items-center justify-center"
          style={{
            opacity: 0.0000001,
            transform: 'scale(100)'
          }}
        >
          <GoogleLogin
            width="56"
            type="icon"
            size="large"
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
        </div>

        <WaasLoginContent />
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
      disableTooltip
    />
  ) : null
}

export const EpicWaasConnectButton = (props: ConnectButtonProps) => {
  const { connector } = props

  const { data: authUrl } = useStorageItem(LocalStorageKey.WaasEpicAuthUrl)

  return authUrl ? (
    <ConnectButton
      {...props}
      connector={connector}
      onConnect={() => {
        window.location.href = authUrl
      }}
      disableTooltip
    />
  ) : null
}

export const XWaasConnectButton = (props: ConnectButtonProps) => {
  const { connector, onConnect } = props
  const storage = useStorage()

  const [XCodeVerifier, setXCodeVerifier] = useState<string>('')
  const [XClientId, setXClientId] = useState<string>('')
  const [XRedirectURI, setXRedirectURI] = useState<string>('')

  const { data: authUrl } = useStorageItem(LocalStorageKey.WaasXAuthUrl)

  useEffect(() => {
    const getStorageItems = async () => {
      const codeVerifier = await storage?.getItem(LocalStorageKey.WaasXCodeVerifier)
      const XClientId = await storage?.getItem(LocalStorageKey.WaasXClientID)
      const XRedirectURI = await storage?.getItem(LocalStorageKey.WaasXRedirectURI)
      setXCodeVerifier(codeVerifier ?? '')
      setXClientId(XClientId ?? '')
      setXRedirectURI(XRedirectURI ?? '')
    }
    getStorageItems()
  }, [])

  return (
    <ConnectButton
      {...props}
      connector={connector}
      onConnect={() => {
        const popup = window.open(authUrl as string, 'XAuthPopup', 'width=700,height=700')

        const handleMessage = async (event: MessageEvent) => {
          if (event.data?.type !== 'OAUTH_RETURN') {
            return
          }

          if (event.source !== popup) {
            return
          }

          window.removeEventListener('message', handleMessage)
          popup?.close()

          const { code } = event.data.data || {}

          if (code && XCodeVerifier) {
            try {
              const idToken = await getXIdToken(code, XCodeVerifier, XClientId, XRedirectURI)
              storage?.setItem(LocalStorageKey.WaasXIdToken, idToken)
              onConnect(connector)
            } catch (error) {
              console.log('X login error', error)
            }
          }
        }

        window.addEventListener('message', handleMessage)
      }}
      disableTooltip
    />
  )
}
