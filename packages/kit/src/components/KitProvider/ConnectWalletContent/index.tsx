import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  ChevronLeftIcon,
  ChevronRightIcon,
  Divider,
  Text,
  TextInput,
  vars,
  useTheme,
  Spinner
} from '@0xsequence/design-system'
import { useConnect, useAccount } from 'wagmi'
import { EMAIL_CONNECTOR_LOCAL_STORAGE_KEY } from '@0xsequence/kit-connectors'
import { GoogleLogin } from '@react-oauth/google'
import { appleAuthHelpers, useScript } from 'react-apple-signin-auth'

import { ExtendedWalletList } from './ExtendedWalletList'
import { Banner } from './Banner'

import { KitConfig } from '../../index'
import { LocalStorageKey, defaultSignInOptions } from '../../../constants'
import { isEmailValid } from '../../../utils'
import { KitConnectProviderProps } from '../index'
import { ExtendedConnector } from '../../../utils/getKitConnectWallets'

import * as styles from '../../styles.css'
import { useEmailAuth } from '../../../hooks/useWaasEmailAuth'
import { PINCodeInput } from './PINCodeInput'

interface ConnectWalletContentProps extends KitConnectProviderProps {
  openConnectModal: boolean
  setOpenConnectModal: React.Dispatch<React.SetStateAction<boolean>>
}

export const ConnectWalletContent = (props: ConnectWalletContentProps) => {
  useScript(appleAuthHelpers.APPLE_SCRIPT_SRC)

  const { isConnected } = useAccount()
  const { theme } = useTheme()
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
  /* @ts-ignore-next-line */
  const connectors = baseConnectors.filter(c => !!c?._wallet) as ExtendedConnector[]
  const [showExtendedList, setShowExtendedList] = useState<boolean>(false)
  const mockConnector = connectors.find(connector => {
    return connector._wallet.id === 'mock'
  })

  const emailConnector = connectors.find(c => c._wallet.id.includes('email'))
  const walletConnectors = connectors
    .filter(connector => {
      const foundOption = walletAuthOptions.find(authOption => authOption === connector._wallet.id)
      return !!foundOption
    })
    .sort((a, b) => {
      return walletAuthOptions.indexOf(a._wallet.id) - walletAuthOptions.indexOf(b._wallet.id)
    })

  const socialAuthConnectors = connectors
    .filter(connector => {
      const foundOption = socialAuthOptions.find(authOption => authOption === connector._wallet.id)
      return !!foundOption
    })
    .sort((a, b) => {
      return socialAuthOptions.indexOf(a._wallet.id) - socialAuthOptions.indexOf(b._wallet.id)
    })

  const displayExtendedListButton = walletConnectors.length > 4

  const onChangeEmail = (ev: React.ChangeEventHandler<HTMLInputElement>) => {
    /* @ts-ignore-next-line */
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
      localStorage.setItem(LocalStorageKey.WaasEmailIdToken, idToken)
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
      localStorage.setItem(EMAIL_CONNECTOR_LOCAL_STORAGE_KEY, email || '')
    }

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
      localStorage.setItem(EMAIL_CONNECTOR_LOCAL_STORAGE_KEY, email)

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
        <Box
          as="button"
          position="absolute"
          style={{ top: '20px' }}
          onClick={() => setShowExtendedList(false)}
          className={styles.clickable}
        >
          <ChevronLeftIcon />
        </Box>
        <ExtendedWalletList connectors={walletConnectors} onConnect={onConnect} />
      </>
    )
  }

  return (
    <>
      <Banner config={config as KitConfig} />
      <Box marginTop="5">
        {emailConnector && showEmailInput && (
          <>
            <form onSubmit={onConnectInlineEmail}>
              <TextInput
                /* @ts-ignore-next-line */
                onChange={onChangeEmail}
                value={email}
                name="email"
                placeholder="Enter email"
                data-1p-ignore
              />
              <Box alignItems="center" justifyContent="center" style={{ height: '48px' }}>
                {!emailAuthInProgress && (
                  <Button
                    type="submit"
                    disabled={!isEmailValid(email)}
                    marginTop="4"
                    width="full"
                    label="Continue"
                    rightIcon={ChevronRightIcon}
                  />
                )}
                {emailAuthInProgress && <Spinner marginTop="4" />}
              </Box>
            </form>
          </>
        )}
        {socialAuthConnectors.length > 0 && (
          <>
            {emailConnector && showEmailInput && (
              <>
                <Box style={{ marginBottom: '-4px' }}>
                  <Divider color="backgroundSecondary" />
                </Box>
                <Box justifyContent="center" alignItems="center">
                  <Text variant="small" color="text50">
                    or sign in via
                  </Text>
                </Box>
              </>
            )}
            <Box marginTop="3" gap="2" flexDirection="row" justifyContent="center" alignItems="center" flexWrap="wrap">
              {socialAuthConnectors.map(connector => {
                const Logo =
                  theme === 'dark'
                    ? (connector._wallet.monochromeLogoDark as React.FunctionComponent)
                    : (connector._wallet.monochromeLogoLight as React.FunctionComponent)
                return (
                  <Box
                    key={connector._wallet.id}
                    aspectRatio="1/1"
                    alignItems="center"
                    justifyContent="center"
                    style={{ width: '40px', height: '40px', margin: '12px 4px' }}
                  >
                    {connector._wallet.id === 'google-waas' && (
                      <Box className={styles.googleWaasButtonContainer}>
                        <GoogleLogin
                          type="icon"
                          size="large"
                          nonce={localStorage.getItem(LocalStorageKey.WaasSessionHash) ?? undefined}
                          onSuccess={credentialResponse => {
                            if (credentialResponse.credential) {
                              localStorage.setItem(LocalStorageKey.WaasGoogleIdToken, credentialResponse.credential)
                              onConnect(connector)
                            }
                          }}
                          onError={() => {
                            console.log('Login Failed')
                          }}
                        />
                      </Box>
                    )}
                    {connector._wallet.id === 'apple-waas' && (
                      <Card
                        width="full"
                        height="full"
                        padding="2"
                        borderRadius="xs"
                        className={styles.clickable}
                        justifyContent="center"
                        alignItems="center"
                        onClick={() => {
                          const appleClientId = localStorage.getItem(LocalStorageKey.WaasAppleClientID) || ''
                          const appleRedirectUri = localStorage.getItem(LocalStorageKey.WaasAppleRedirectURI) || ''
                          const sessionHash = localStorage.getItem(LocalStorageKey.WaasSessionHash) || ''
                          appleAuthHelpers.signIn({
                            authOptions: {
                              clientId: appleClientId,
                              scope: 'openid email',
                              redirectURI: appleRedirectUri,
                              usePopup: true,
                              nonce: sessionHash
                            },
                            onSuccess: (response: any) => {
                              if (response.authorization?.id_token) {
                                localStorage.setItem(LocalStorageKey.WaasAppleIdToken, response.authorization.id_token)
                                onConnect(connector)
                              } else {
                                console.log('Apple login error: No id_token found')
                              }
                            },
                            onError: (error: any) => console.error(error)
                          })
                        }}
                      >
                        <Box width="12" height="12" flexDirection="column" alignItems="center" justifyContent="center">
                          <Logo />
                        </Box>
                      </Card>
                    )}
                    {!connector._wallet.id.includes('waas') && (
                      <Card
                        width="full"
                        height="full"
                        padding="2"
                        borderRadius="xs"
                        className={styles.clickable}
                        justifyContent="center"
                        alignItems="center"
                        onClick={() => {
                          onConnect(connector)
                        }}
                      >
                        <Box width="16" height="16" flexDirection="column" alignItems="center" justifyContent="center">
                          <Logo />
                        </Box>
                      </Card>
                    )}
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
                <Box style={{ marginBottom: '-4px' }}>
                  <Divider color="backgroundSecondary" />
                </Box>
                <Box justifyContent="center" alignItems="center">
                  <Text variant="small" color="text50">
                    or select a wallet
                  </Text>
                </Box>
              </>
            )}
            <Box marginTop="2" gap="2" flexDirection="row" justifyContent="center" alignItems="center">
              {walletConnectors.map(connector => {
                const Logo =
                  theme === 'dark'
                    ? (connector._wallet.logoDark as React.FunctionComponent) ||
                      (connector._wallet.logoDark as React.FunctionComponent)
                    : (connector._wallet.logoLight as React.FunctionComponent) ||
                      (connector._wallet.logoLight as React.FunctionComponent)
                return (
                  <Card
                    key={connector._wallet.id}
                    style={{ width: '43px', height: '43px', margin: '12px 4px' }}
                    padding="2"
                    borderRadius="xs"
                    className={styles.clickable}
                    justifyContent="center"
                    alignItems="center"
                    onClick={() => onConnect(connector)}
                  >
                    <Box width="16" height="16" flexDirection="column" alignItems="center" justifyContent="center">
                      <Logo />
                    </Box>
                  </Card>
                )
              })}
            </Box>
            {displayExtendedListButton && (
              <Box
                padding="4"
                marginTop="3"
                background="backgroundSecondary"
                width="full"
                justifyContent="space-between"
                alignItems="center"
                borderRadius="md"
                color="text100"
                as="button"
                className={styles.clickable}
                onClick={() => setShowExtendedList(true)}
              >
                <Text variant="medium">More options</Text>
                <ChevronRightIcon />
              </Box>
            )}
          </>
        )}
      </Box>
    </>
  )
}
