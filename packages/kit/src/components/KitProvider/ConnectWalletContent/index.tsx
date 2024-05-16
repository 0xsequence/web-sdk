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
  PINCodeInput
} from '@0xsequence/design-system'
import { LogoProps } from '@0xsequence/kit-connectors'
import { GoogleLogin } from '@react-oauth/google'
import React, { useState, useEffect } from 'react'
import { appleAuthHelpers, useScript } from 'react-apple-signin-auth'
import { useConnect, useAccount } from 'wagmi'

import { LocalStorageKey, defaultSignInOptions } from '../../../constants'
import { useStorage, useStorageItem } from '../../../hooks/useStorage'
import { useEmailAuth } from '../../../hooks/useWaasEmailAuth'
import { ExtendedConnector, KitConfig } from '../../../types'
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
  const {
    showEmailInput = defaultSignInOptions.showEmailInput,
    socialAuthOptions = defaultSignInOptions.socialAuthOptions,
    walletAuthOptions = defaultSignInOptions.walletAuthOptions
  } = signIn

  const { openConnectModal, setOpenConnectModal } = props

  const [email, setEmail] = useState('')
  const [showEmailWaasPinInput, setShowEmailWaasPinInput] = useState(false)
  const [waasEmailPinCode, setWaasEmailPinCode] = useState<string[]>([])
  const { connectors: baseConnectors, connect } = useConnect()

  // EIP-6963 connectors will not have the _wallet property
  const injectedConnectors: ExtendedConnector[] = baseConnectors
    .filter(c => c.type === 'injected' && !c.hasOwnProperty('_wallet'))
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
          logoDark: Logo
        }
      }
    })

  /* @ts-ignore-next-line */
  const connectors = baseConnectors.filter(c => !!c?._wallet) as ExtendedConnector[]
  const [showExtendedList, setShowExtendedList] = useState<boolean>(false)
  const mockConnector = connectors.find(connector => {
    return connector._wallet.id === 'mock'
  })

  const emailConnector = connectors.find(c => c._wallet.id.includes('email'))
  const walletConnectors = [
    ...connectors
      .filter(connector => {
        const foundOption =
          walletAuthOptions.find(authOption => authOption === connector._wallet.id) &&
          !injectedConnectors.some(injected => injected.name === connector.name)
        return !!foundOption
      })
      .sort((a, b) => {
        return walletAuthOptions.indexOf(a._wallet.id) - walletAuthOptions.indexOf(b._wallet.id)
      }),
    ...injectedConnectors
  ]

  const socialAuthConnectors = connectors
    .filter(connector => {
      const foundOption = socialAuthOptions.find(authOption => authOption === connector._wallet.id)
      return !!foundOption
    })
    .sort((a, b) => {
      return socialAuthOptions.indexOf(a._wallet.id) - socialAuthOptions.indexOf(b._wallet.id)
    })

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
    connector: connectors.find(c => c._wallet.id === 'email-waas'),
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

    // Open Metamask download page if Metamask window.ethereum is not found
    if (connector._wallet.id === 'metamask' && typeof window !== 'undefined') {
      const isMetamaskFound = !!window?.ethereum?._metamask

      if (!isMetamaskFound) {
        window.open('https://metamask.io/download/')
        return
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
        {emailConnector && showEmailInput && (
          <form onSubmit={onConnectInlineEmail}>
            <TextInput onChange={onChangeEmail} value={email} name="email" placeholder="Enter email" data-1p-ignore />
            <Box alignItems="center" justifyContent="center" marginTop="4">
              {!emailAuthInProgress && (
                <Button
                  type="submit"
                  disabled={!isEmailValid(email)}
                  width="full"
                  label="Continue"
                  rightIcon={ChevronRightIcon}
                />
              )}
              {emailAuthInProgress && <Spinner />}
            </Box>
          </form>
        )}

        {socialAuthConnectors.length > 0 && (
          <>
            {emailConnector && showEmailInput && (
              <>
                <Divider color="backgroundSecondary" />
                <Box justifyContent="center" alignItems="center">
                  <Text variant="small" color="text50">
                    or sign in via
                  </Text>
                </Box>
              </>
            )}
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
            </Box>
          </>
        )}

        {walletConnectors.length > 0 && (
          <>
            {((emailConnector && showEmailInput) || socialAuthConnectors.length > 0) && (
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
              {walletConnectors.slice(0, 7).map(connector => (
                <ConnectButton key={connector.uid} connector={connector} onConnect={onConnect} />
              ))}
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
      </Box>
    </>
  )
}

interface ConnectButtonProps {
  connector: ExtendedConnector
  label?: string
  onConnect: (connector: ExtendedConnector) => void
}

const ConnectButton = (props: ConnectButtonProps) => {
  const { connector, label, onConnect } = props
  const { theme } = useTheme()
  const walletProps = connector._wallet

  const Logo =
    theme === 'dark'
      ? walletProps.monochromeLogoDark || walletProps.logoDark
      : walletProps.monochromeLogoLight || walletProps.logoLight

  return (
    <Tooltip message={label || walletProps.name}>
      <Card
        clickable
        width="10"
        height="10"
        padding="2"
        borderRadius="xs"
        justifyContent="center"
        alignItems="center"
        onClick={() => onConnect(connector)}
      >
        <Box as={Logo} width="6" height="6" />
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

  const Logo =
    theme === 'dark'
      ? walletProps.monochromeLogoDark || walletProps.logoDark
      : walletProps.monochromeLogoLight || walletProps.logoLight

  useEffect(() => {
    setTimeout(() => {
      setEnableGoogleTooltip(true)
    }, 300)
  })

  return !isPendingNonce ? (
    <Tooltip message="Google" disabled={!enableGoogleTooltip}>
      <Card clickable background="transparent" borderRadius="xs" padding="0" width="10" height="10" position="relative">
        <Box
          width="10"
          height="10"
          overflow="hidden"
          borderRadius="sm"
          alignItems="center"
          justifyContent="center"
          style={{ opacity: 0.0000001 }}
        >
          <GoogleLogin
            type="icon"
            size="large"
            width={40}
            nonce={sessionHash}
            onSuccess={credentialResponse => {
              if (credentialResponse.credential) {
                console.log(credentialResponse)
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
          width="10"
          height="10"
          top="0"
          right="0"
        >
          <Box as={Logo} width="6" height="6" />
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
