import {
  Box,
  Button,
  ChevronLeftIcon,
  ChevronRightIcon,
  Divider,
  Text,
  TextInput,
  Spinner,
  Image,
  IconButton
} from '@0xsequence/design-system'
import React, { useState, useEffect } from 'react'
import { appleAuthHelpers, useScript } from 'react-apple-signin-auth'
import { useConnect, useAccount } from 'wagmi'

import { LocalStorageKey } from '../../constants'
import { useStorage } from '../../hooks/useStorage'
import { useEmailAuth } from '../../hooks/useWaasEmailAuth'
import { FormattedEmailConflictInfo } from '../../hooks/useWaasEmailConflict'
import { ExtendedConnector, KitConfig, LogoProps } from '../../types'
import { isEmailValid } from '../../utils/helpers'
import { AppleWaasConnectButton, ConnectButton, EmailConnectButton, GoogleWaasConnectButton } from '../ConnectButton'
import { KitConnectProviderProps } from '../KitProvider/KitProvider'
import { PoweredBySequence } from '../SequenceLogo'

import { Banner } from './Banner'
import { EmailWaasVerify } from './EmailWaasVerify'
import { ExtendedWalletList } from './ExtendedWalletList'

interface ConnectWalletContentProps extends KitConnectProviderProps {
  emailConflictInfo?: FormattedEmailConflictInfo | null
  onClose: () => void
}

export const Connect = (props: ConnectWalletContentProps) => {
  useScript(appleAuthHelpers.APPLE_SCRIPT_SRC)

  const { onClose, emailConflictInfo, config = {} } = props
  const { signIn = {} } = config as KitConfig
  const { isConnected } = useAccount()
  const storage = useStorage()

  const [email, setEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState<boolean>(false)
  const [showEmailWaasPinInput, setShowEmailWaasPinInput] = useState(false)
  const [showExtendedList, setShowExtendedList] = useState<boolean>(false)
  const { connectors, connect } = useConnect()
  const hasInjectedSequenceConnector = connectors.some(c => c.id === 'app.sequence')

  const baseWalletConnectors = (connectors as ExtendedConnector[])
    .filter(c => {
      return c._wallet && (c._wallet.type === 'wallet' || c._wallet.type === undefined)
    })
    // Remove sequence if wallet extension detected
    .filter(c => {
      if (c._wallet?.id === 'sequence' && hasInjectedSequenceConnector) {
        return false
      }

      return true
    })

  const mockConnector = baseWalletConnectors.find(connector => {
    return connector._wallet.id === 'mock'
  })

  // EIP-6963 connectors will not have the _wallet property
  const injectedConnectors: ExtendedConnector[] = connectors
    .filter(c => c.type === 'injected')
    // Remove the injected connectors when another connector is already in the base connectors
    .filter(connector => {
      if (connector.id === 'com.coinbase.wallet') {
        return !connectors.find(connector => (connector as ExtendedConnector)?._wallet?.id === 'coinbase-wallet')
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

  const socialAuthConnectors = (connectors as ExtendedConnector[]).filter(c => c._wallet?.type === 'social')
  const walletConnectors = [...baseWalletConnectors, ...injectedConnectors]
  const emailConnector = socialAuthConnectors.find(c => c._wallet.id.includes('email'))
  const isEmailOnly = emailConnector && socialAuthConnectors.length === 1
  const displayExtendedListButton = walletConnectors.length > 7

  const onChangeEmail: React.ChangeEventHandler<HTMLInputElement> = ev => {
    setEmail(ev.target.value)
  }

  // Close after successful connection
  useEffect(() => {
    if (isConnected) {
      onClose()
    }
  }, [isConnected])

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

  const {
    inProgress: emailAuthInProgress,
    loading: emailAuthLoading,
    error: emailAuthError,
    initiateAuth: initiateEmailAuth,
    sendChallengeAnswer
  } = useEmailAuth({
    connector: emailConnector,
    onSuccess: async result => {
      if ('signInResponse' in result && result.signInResponse?.email) {
        storage?.setItem(LocalStorageKey.WaasSignInEmail, result.signInResponse.email)
      }

      if (emailConnector) {
        if (result.version === 1) {
          // Store the version 1 idToken so that it can be used to authenticate during a refresh
          storage?.setItem(LocalStorageKey.WaasEmailIdToken, result.idToken)
        }

        connect({ connector: emailConnector })
      }
    }
  })

  // Hide the email input if there is an email conflict
  useEffect(() => {
    if (emailConflictInfo) {
      setShowEmailWaasPinInput(false)
    }
  }, [emailConflictInfo])

  if (showEmailWaasPinInput) {
    return <EmailWaasVerify error={emailAuthError} isLoading={emailAuthLoading} onConfirm={sendChallengeAnswer} />
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
            {socialAuthConnectors.length > 0 && (
              <Box marginTop="2" gap="2" flexDirection="row" justifyContent="center" alignItems="center" flexWrap="wrap">
                {socialAuthConnectors.map(connector => {
                  return (
                    <Box key={connector.uid} aspectRatio="1/1" alignItems="center" justifyContent="center">
                      {connector._wallet.id === 'google-waas' ? (
                        <GoogleWaasConnectButton connector={connector} onConnect={onConnect} />
                      ) : connector._wallet.id === 'apple-waas' ? (
                        <AppleWaasConnectButton connector={connector} onConnect={onConnect} />
                      ) : connector._wallet.id.includes('email') ? (
                        <EmailConnectButton onClick={() => setShowEmailInput(true)} />
                      ) : (
                        <ConnectButton connector={connector} onConnect={onConnect} />
                      )}
                    </Box>
                  )
                })}
              </Box>
            )}
          </>
        )}

        {walletConnectors.length > 0 && !showEmailInput && (
          <>
            {socialAuthConnectors.length > 0 && (
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
      </Box>

      <PoweredBySequence />
    </>
  )
}
