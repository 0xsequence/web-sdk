import {
  Box,
  Button,
  Card,
  ChevronLeftIcon,
  ChevronRightIcon,
  Divider,
  Text,
  TextInput,
  useTheme,
  Spinner,
  Image,
  IconButton,
  Tooltip,
  PINCodeInput,
  EmailIcon
} from '@0xsequence/design-system'
import { GoogleLogin } from '@react-oauth/google'
import React, { useState, useEffect } from 'react'
import { appleAuthHelpers, useScript } from 'react-apple-signin-auth'
import { useConnect, useAccount } from 'wagmi'

import { LocalStorageKey } from '../../../constants'
import { useStorage, useStorageItem } from '../../../hooks/useStorage'
import { useEmailAuth } from '../../../hooks/useWaasEmailAuth'
import { ExtendedConnector, KitConfig, LogoProps, WalletProperties } from '../../../types'
import { isEmailValid } from '../../../utils/helpers'
import { KitConnectProviderProps } from '../index'

import { Banner } from './Banner'
import { ExtendedWalletList } from './ExtendedWalletList'

interface ConnectWalletContentProps extends KitConnectProviderProps {
  openConnectModal: boolean
  setOpenConnectModal: React.Dispatch<React.SetStateAction<boolean>>
}

export const ConnectWalletContent = (props: ConnectWalletContentProps) => {
  useScript(appleAuthHelpers.APPLE_SCRIPT_SRC)

  const storage = useStorage()
  const { isConnected } = useAccount()
  const { config = {} } = props
  const { signIn = {} } = config as KitConfig

  const { openConnectModal, setOpenConnectModal } = props

  const [email, setEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState<boolean>(false)
  const [showEmailWaasPinInput, setShowEmailWaasPinInput] = useState(false)
  const [waasEmailPinCode, setWaasEmailPinCode] = useState<string[]>([])
  const { connectors: baseConnectors, connect } = useConnect()

  const injectedSequenceConnector = baseConnectors.find(c => c.id === 'app.sequence')

  const baseWalletConnectors = baseConnectors
  .filter(c => {
      /* @ts-ignore-next-line */
      const isWalletProperties = !!c?._wallet
      /* @ts-ignore-next-line */
      const isWallet = (c?._wallet?.type || 'wallet') === 'wallet'
      /* @ts-ignore-next-line */
      const displayEmailConnector = c?._wallet?.id === 'email'

      return  isWalletProperties && (isWallet || displayEmailConnector)
    })
    // Remove sequence if wallet extension detected
   .filter(c => {
    /* @ts-ignore-next-line */
    if (c?._wallet?.id === 'sequence' && injectedSequenceConnector) {
      return false
    }

    return true
   })  as ExtendedConnector[]
  const [showExtendedList, setShowExtendedList] = useState<boolean>(false)
  const mockConnector = baseWalletConnectors.find(connector => {
    return connector._wallet.id === 'mock'
  })

  /* @ts-ignore-next-line */
  const emailConnector = baseConnectors.find(c => c?._wallet?.id.includes('email'))

  // EIP-6963 connectors will not have the _wallet property
  const injectedConnectors: ExtendedConnector[] = baseConnectors
    .filter(c => c.type === 'injected')
    // Remove the injected connectors when another connector is already in the base connectors
    .filter((connector) => {
      if (connector.id === 'com.coinbase.wallet') {
        return !baseConnectors.find(connector => (connector as ExtendedConnector)?._wallet?.id === 'coinbase-wallet')
      }

      return true
    })
    .map(connector => {
      const Logo = (props: LogoProps) => {
        return <Image src={connector.icon} alt={connector.name} disableAnimation {...props} />
      }

      return {
        ...connector,
        _wallet: {
          id: connector.id,
          name: connector.name,
          logoLight: Logo,
          logoDark: Logo,
          type: 'wallet'
        }
      }
    })


  const walletConnectors = [
    ...baseWalletConnectors,
    ...injectedConnectors
  ]

  const socialAuthConnectors = baseConnectors
    /* @ts-ignore-next-line */
    .filter(c => (c?._wallet?.type === 'social'))
    /* @ts-ignore-next-line */
    .filter(c => !c?._wallet?.id?.includes('email')) as ExtendedConnector[]

  const isEmailOnly = emailConnector && socialAuthConnectors.length === 0 && walletConnectors.length === 0

  const displayExtendedListButton = walletConnectors.length > 7

  const onChangeEmail: React.ChangeEventHandler<HTMLInputElement> = ev => {
    setEmail(ev.target.value)
  }

  const {
    inProgress: emailAuthInProgress,
    loading: emailAuthLoading,
    initiateAuth: initiateEmailAuth,
    sendChallengeAnswer
  } = useEmailAuth({
    connector: baseWalletConnectors.find(c => c._wallet.id === 'email-waas'),
    onSuccess: async idToken => {
      storage?.setItem(LocalStorageKey.WaasEmailIdToken, idToken)
      if (emailConnector) {
        connect({ connector: emailConnector })
      }
    }
  })

  useEffect(() => {
    if (isConnected && openConnectModal) {
      setOpenConnectModal(false)
    }
  }, [isConnected, openConnectModal])

  const onConnect = (connector: ExtendedConnector) => {
    if (signIn.useMock && mockConnector) {
      connect({ connector: mockConnector })
      return
    }

    if (connector._wallet.id === 'email') {
      const email = prompt('Auto-email login, please specify the email address:')

      if ('setEmail' in connector) {
        ;(connector as any).setEmail(email)
      }
    }

    connect({ connector })
  }

  const onConnectInlineEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (signIn.useMock && mockConnector) {
      connect({ connector: mockConnector })
      return
    }

    if (emailConnector) {
      if ('setEmail' in emailConnector) {
        ;(emailConnector as any).setEmail(email)
      }

      /* @ts-ignore-next-line */
      if (emailConnector._wallet.id === 'email-waas') {
        try {
          await initiateEmailAuth(email)
          setShowEmailWaasPinInput(true)
        } catch (e) {
          console.log(e)
        }
      } else {
        connect({ connector: emailConnector })
      }
    }
  }

  if (showEmailWaasPinInput) {
    return (
      <>
        <Box paddingY="6" alignItems="center" justifyContent="center" flexDirection="column">
          <Text marginTop="5" marginBottom="4" variant="normal" color="text80">
            Enter code received in email.
          </Text>
          <PINCodeInput value={waasEmailPinCode} digits={6} onChange={setWaasEmailPinCode} />

          <Box gap="2" marginY="4" alignItems="center" justifyContent="center" style={{ height: '44px' }}>
            {emailAuthLoading ? (
              <Spinner />
            ) : (
              <Button
                variant="primary"
                disabled={waasEmailPinCode.includes('')}
                label="Verify"
                onClick={() => sendChallengeAnswer?.(waasEmailPinCode.join(''))}
                data-id="verifyButton"
              />
            )}
          </Box>
        </Box>
      </>
    )
  }

  if (showExtendedList) {
    return (
      <>
        <Box position="absolute" top="4">
          <IconButton icon={ChevronLeftIcon} onClick={() => setShowExtendedList(false)} size="xs" />
        </Box>
        <ExtendedWalletList connectors={walletConnectors} onConnect={onConnect} />
      </>
    )
  }

  return (
    <>
      <Banner config={config as KitConfig} />

      <Box marginTop="6">
        {emailConnector && (showEmailInput || isEmailOnly) ? (
          <form onSubmit={onConnectInlineEmail}>
            <TextInput onChange={onChangeEmail} value={email} name="email" placeholder="Enter email" data-1p-ignore />
            <Box alignItems="center" justifyContent="center" marginTop="4">
              {!emailAuthInProgress && (
                <Box gap="2" width="full">
                  {!isEmailOnly && <Button label="Back" width="full" onClick={() => setShowEmailInput(false)} />}

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!isEmailValid(email)}
                    width="full"
                    label="Continue"
                    rightIcon={ChevronRightIcon}
                  />
                </Box>
              )}
              {emailAuthInProgress && <Spinner />}
            </Box>
          </form>
        ) : (
          <>
            {(emailConnector || socialAuthConnectors.length > 0) && (
              <Box marginTop="2" gap="2" flexDirection="row" justifyContent="center" alignItems="center" flexWrap="wrap">
                {socialAuthConnectors.map(connector => {
                  return (
                    <Box key={connector.uid} aspectRatio="1/1" alignItems="center" justifyContent="center">
                      {connector._wallet.id === 'google-waas' && (
                        <GoogleWaasConnectButton connector={connector} onConnect={onConnect} />
                      )}

                      {connector._wallet.id === 'apple-waas' && (
                        <AppleWaasConnectButton connector={connector} onConnect={onConnect} />
                      )}

                      {!connector._wallet.id.includes('waas') && <ConnectButton connector={connector} onConnect={onConnect} />}
                    </Box>
                  )
                })}

                {emailConnector && (
                  <Box aspectRatio="1/1" alignItems="center" justifyContent="center">
                    <EmailConnectButton onClick={() => setShowEmailInput(true)} />
                  </Box>
                )}
              </Box>
            )}

            {walletConnectors.length > 0 && (
              <>
                {(emailConnector || socialAuthConnectors.length > 0) && (
                  <>
                    <Divider color="backgroundSecondary" />
                    <Box justifyContent="center" alignItems="center">
                      <Text variant="small" color="text50">
                        or select a wallet
                      </Text>
                    </Box>
                  </>
                )}
                <Box marginTop="2" gap="2" flexDirection="row" justifyContent="center" alignItems="center">
                  {walletConnectors.slice(0, 7).map(connector => {
                    if (connector._wallet.id === 'email' || connector._wallet.id === 'email-waas') {
                      return null
                    }

                    return <ConnectButton key={connector.uid} connector={connector} onConnect={onConnect} />
                  })}
                </Box>

                {displayExtendedListButton && (
                  <Box marginTop="4" justifyContent="center">
                    <Button
                      shape="square"
                      size="xs"
                      onClick={() => setShowExtendedList(true)}
                      label="More options"
                      rightIcon={ChevronRightIcon}
                    />
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Box>
    </>
  )
}

const BUTTON_SIZE = '14'
const ICON_SIZE = '10'

interface ConnectButtonProps {
  connector: ExtendedConnector
  label?: string
  onConnect: (connector: ExtendedConnector) => void
}

const ConnectButton = (props: ConnectButtonProps) => {
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

const GoogleWaasConnectButton = (props: ConnectButtonProps) => {
  const { connector, onConnect } = props
  const storage = useStorage()
  const { data: sessionHash, isPending: isPendingNonce } = useStorageItem(LocalStorageKey.WaasSessionHash)
  const [enableGoogleTooltip, setEnableGoogleTooltip] = useState(false)
  const { theme } = useTheme()
  const walletProps = connector._wallet

  const Logo = getLogo(theme, walletProps)

  useEffect(() => {
    setTimeout(() => {
      setEnableGoogleTooltip(true)
    }, 300)
  })

  return !isPendingNonce ? (
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
            nonce={sessionHash}
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
  ) : null
}

export const AppleWaasConnectButton = (props: ConnectButtonProps) => {
  const { connector, onConnect } = props
  const storage = useStorage()
  const { data: sessionHash, isPending: isPendingNonce } = useStorageItem(LocalStorageKey.WaasSessionHash)
  const { data: appleClientId } = useStorageItem(LocalStorageKey.WaasAppleClientID)
  const { data: appleRedirectUri } = useStorageItem(LocalStorageKey.WaasAppleRedirectURI)

  return !isPendingNonce && appleClientId && appleRedirectUri ? (
    <ConnectButton
      connector={connector}
      onConnect={() => {
        appleAuthHelpers.signIn({
          authOptions: {
            clientId: appleClientId,
            redirectURI: appleRedirectUri,
            nonce: sessionHash,
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

const getLogo = (theme: any, walletProps: WalletProperties) =>
  theme === 'dark'
    ? walletProps.logoDark || walletProps.monochromeLogoDark
    : walletProps.logoLight || walletProps.monochromeLogoLight
