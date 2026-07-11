import { Card, ContextMenuIcon, Text, Tooltip, useTheme } from '@0xsequence/design-system'
import { GoogleLogin, type GoogleLoginProps } from '@react-oauth/google'
import { useEffect, useRef, useState } from 'react'
import { appleAuthHelpers } from 'react-apple-signin-auth'

import { getXIdToken } from '../../connectors/X/XAuth.js'
import { LocalStorageKey } from '../../constants/localStorage.js'
import { useStorage, useStorageItem } from '../../hooks/useStorage.js'
import type { ExtendedConnector, WalletProperties } from '../../types.js'

const BUTTON_HEIGHT = '52px'
const BUTTON_HEIGHT_TEXT = '44px'
const BUTTON_HEIGHT_DESCRIPTIVE = '40px'
// Standard Google buttons have an intrinsic localized text width; narrow connector cells use the official icon variant.
const GOOGLE_STANDARD_BUTTON_MIN_WIDTH = 240
const iconSizeClasses = 'w-8 h-8'
const iconTextSizeClasses = 'w-6 h-6'
const iconDescriptiveSizeClasses = 'w-5 h-5'

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
          className="flex items-center justify-center w-full"
          clickable
          onClick={() => onConnect(connector)}
          style={{
            height: isDescriptive ? BUTTON_HEIGHT_DESCRIPTIVE : BUTTON_HEIGHT_TEXT,
            ...(isDescriptive ? { borderRadius: '9999px', gap: '10px', padding: '0 16px' } : {})
          }}
        >
          <Logo className={isDescriptive ? iconDescriptiveSizeClasses : iconTextSizeClasses} />
          <Text color="primary" variant="normal" fontWeight={isDescriptive ? 'medium' : 'bold'}>
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

export const GuestWaasConnectButton = (
  props: ConnectButtonProps & {
    setIsLoading: (isLoading: boolean) => void
    setConnectingConnector?: (connector: ExtendedConnector | null) => void
  }
) => {
  const { connector, onConnect, setIsLoading, setConnectingConnector } = props

  return (
    <ConnectButton
      {...props}
      connector={connector}
      onConnect={() => {
        setIsLoading(true)
        setConnectingConnector?.(connector)
        onConnect(connector)
      }}
      disableTooltip
    />
  )
}

export const GoogleWaasConnectButton = (
  props: ConnectButtonProps & {
    setIsLoading?: (isLoading: boolean) => void
    setConnectingConnector?: (connector: ExtendedConnector | null) => void
  }
) => {
  const { connector, onConnect, isDescriptive = false, setIsLoading, setConnectingConnector } = props
  const storage = useStorage()
  const containerRef = useRef<HTMLDivElement>(null)
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(true)
  const [buttonWidth, setButtonWidth] = useState(0)
  const [useIconButton, setUseIconButton] = useState(true)

  const { theme } = useTheme()

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const updateButtonWidth = () => {
      const availableWidth = containerRef.current?.clientWidth ?? 0
      const nextButtonWidth = Math.min(400, Math.floor(availableWidth))
      setButtonWidth(currentWidth => (currentWidth === nextButtonWidth ? currentWidth : nextButtonWidth))
    }

    updateButtonWidth()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateButtonWidth)
      return () => window.removeEventListener('resize', updateButtonWidth)
    }

    const resizeObserver = new ResizeObserver(updateButtonWidth)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    setUseIconButton(buttonWidth < GOOGLE_STANDARD_BUTTON_MIN_WIDTH)
  }, [buttonWidth, theme])

  useEffect(() => {
    if (useIconButton) {
      return
    }

    const buttonContainer = googleButtonRef.current
    const availableWidth = containerRef.current?.clientWidth ?? 0
    if (!buttonContainer || availableWidth === 0) {
      return
    }

    const checkButtonOverflow = () => {
      // GIS makes its iframe wider than the visible button to add click padding, so measure Google's immediate wrapper instead.
      const renderedButton = buttonContainer.querySelector('iframe')?.parentElement
      if (renderedButton && renderedButton.getBoundingClientRect().width > availableWidth + 1) {
        setUseIconButton(true)
      }
    }

    checkButtonOverflow()

    const mutationObserver = new MutationObserver(checkButtonOverflow)
    mutationObserver.observe(buttonContainer, { childList: true, subtree: true, attributes: true })

    return () => mutationObserver.disconnect()
  }, [buttonWidth, theme, useIconButton])

  const buttonHeight = isDescriptive ? BUTTON_HEIGHT_DESCRIPTIVE : BUTTON_HEIGHT
  const useSequenceShell = isDescriptive && !useIconButton
  // GIS supports outline_dark, but @react-oauth/google's theme type has not caught up with the current API.
  const googleButtonTheme = (theme === 'dark' ? 'outline_dark' : 'outline') as GoogleLoginProps['theme']

  return (
    <div
      ref={containerRef}
      className={`relative flex w-full items-center justify-center ${
        useSequenceShell ? 'overflow-hidden rounded-full bg-background-secondary' : ''
      }`}
      style={{ height: buttonHeight, maxWidth: '400px', marginInline: 'auto' }}
    >
      <div ref={googleButtonRef} className="flex max-w-full items-center justify-center">
        {buttonWidth > 0 && (
          <GoogleLogin
            key={`${theme}-${buttonWidth}-${useIconButton ? 'icon' : 'standard'}`}
            width={useIconButton ? undefined : buttonWidth.toString()}
            type={useIconButton ? 'icon' : 'standard'}
            theme={googleButtonTheme}
            size="large"
            shape={useIconButton ? 'circle' : useSequenceShell ? 'rectangular' : 'pill'}
            text={useIconButton ? undefined : 'continue_with'}
            logo_alignment={useIconButton ? undefined : 'center'}
            locale="en"
            onSuccess={credentialResponse => {
              // GIS may finish after the modal has unmounted; ignore stale callbacks after dismissal.
              if (!isMountedRef.current) {
                return
              }

              if (credentialResponse.credential) {
                storage?.setItem(LocalStorageKey.WaasGoogleIdToken, credentialResponse.credential)
                onConnect(connector)
              }
            }}
            onError={() => {
              if (!isMountedRef.current) {
                return
              }

              console.log('Login Failed')
              setIsLoading?.(false)
              setConnectingConnector?.(null)
            }}
          />
        )}
      </div>
      {useSequenceShell && (
        // Keep Google's iframe directly interactive while replacing only its outer border with Sequence's visual shell.
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full border-1 border-border-card">
          <div
            className="absolute rounded-full border-2"
            style={{ inset: '1px', borderColor: 'var(--seq-color-background-secondary)' }}
          />
        </div>
      )}
    </div>
  )
}

export const AppleWaasConnectButton = (
  props: ConnectButtonProps & {
    setIsLoading?: (isLoading: boolean) => void
    setConnectingConnector?: (connector: ExtendedConnector | null) => void
  }
) => {
  const { connector, onConnect, setIsLoading, setConnectingConnector } = props
  const storage = useStorage()

  const { data: appleClientId } = useStorageItem(LocalStorageKey.WaasAppleClientID)
  const { data: appleRedirectUri } = useStorageItem(LocalStorageKey.WaasAppleRedirectURI)

  return appleClientId && appleRedirectUri ? (
    <ConnectButton
      {...props}
      connector={connector}
      onConnect={() => {
        setIsLoading?.(true)
        setConnectingConnector?.(connector)
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
              setIsLoading?.(false)
              setConnectingConnector?.(null)
            }
          },
          onError: (error: any) => {
            console.error(error)
            setIsLoading?.(false)
            setConnectingConnector?.(null)
          }
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

export const XWaasConnectButton = (
  props: ConnectButtonProps & {
    setIsLoading?: (isLoading: boolean) => void
    setConnectingConnector?: (connector: ExtendedConnector | null) => void
  }
) => {
  const { connector, onConnect, setIsLoading, setConnectingConnector } = props
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
        setIsLoading?.(true)
        setConnectingConnector?.(connector)
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
              setIsLoading?.(false)
              setConnectingConnector?.(null)
            }
          } else {
            setIsLoading?.(false)
            setConnectingConnector?.(null)
          }
        }

        window.addEventListener('message', handleMessage)
      }}
      disableTooltip
    />
  )
}
