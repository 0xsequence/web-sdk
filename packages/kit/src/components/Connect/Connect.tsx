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
  IconButton,
  ModalPrimitive
} from '@0xsequence/design-system'
import React, { useState, useEffect } from 'react'
import { appleAuthHelpers, useScript } from 'react-apple-signin-auth'
import { useConnect, useConnections } from 'wagmi'

import { LocalStorageKey } from '../../constants'
import { useLinkedWallets } from '../../hooks/data'
import { useStorage } from '../../hooks/useStorage'
import { useEmailAuth } from '../../hooks/useWaasEmailAuth'
import { FormattedEmailConflictInfo } from '../../hooks/useWaasEmailConflict'
import { useWaasSignatureForLinking } from '../../hooks/useWaasSignatureForLinking'
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
  isPreview?: boolean
}

export const Connect = (props: ConnectWalletContentProps) => {
  useScript(appleAuthHelpers.APPLE_SCRIPT_SRC)

  const { onClose, emailConflictInfo, config = {} as KitConfig, isPreview = false } = props
  const { signIn = {} } = config
  const storage = useStorage()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const projectName = config?.signIn?.projectName

  const [email, setEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState<boolean>(false)
  const [showEmailWaasPinInput, setShowEmailWaasPinInput] = useState(false)
  const [showExtendedList, setShowExtendedList] = useState<boolean>(false)
  const { status, connectors, connect } = useConnect()
  const connections = useConnections()
  const hasInjectedSequenceConnector = connectors.some(c => c.id === 'app.sequence')

  const hasConnectedSocialWallet = connections.some(c => (c.connector as ExtendedConnector)?._wallet?.type === 'social')
  const hasConnectedWaasWallet = connections.some(c => (c.connector as ExtendedConnector)?.type === 'sequence-waas')

  // Get the waas connector from connections
  const waasConnection = connections.find(c => (c.connector as ExtendedConnector)?.type === 'sequence-waas')

  // Get signature for linking wallets
  const {
    message,
    signature,
    address,
    chainId,
    loading: signatureLoading
  } = useWaasSignatureForLinking(waasConnection?.connector)

  // Only fetch linked wallets for embedded wallets
  const { data: linkedWallets } = useLinkedWallets(
    {
      parentWalletAddress: address || '',
      parentWalletMessage: message || '',
      parentWalletSignature: signature || '',
      signatureChainId: `${chainId}`
    },
    {
      enabled: hasConnectedWaasWallet && !!address && !!message && !!signature && !signatureLoading
    }
  )
  console.log('linked wallets:', linkedWallets)

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
      if (connector.id === 'io.metamask') {
        return !connectors.find(connector => (connector as ExtendedConnector)?._wallet?.id === 'metamask-wallet')
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

  useEffect(() => {
    setIsLoading(status === 'pending' || status === 'success')
  }, [status])

  const handleConnect = (connector: ExtendedConnector) => {
    connect({ connector }, { onSettled: onClose })
  }

  const onConnect = (connector: ExtendedConnector) => {
    if (signIn.useMock && mockConnector) {
      handleConnect(mockConnector)
      return
    }

    if (connector._wallet.id === 'email') {
      const email = prompt('Auto-email login, please specify the email address:')

      if ('setEmail' in connector) {
        ;(connector as any).setEmail(email)
      }
    }

    handleConnect(connector)
  }

  const onConnectInlineEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (signIn.useMock && mockConnector) {
      handleConnect(mockConnector)
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
        handleConnect(emailConnector)
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

        handleConnect(emailConnector)
      }
    }
  })

  // Hide the email input if there is an email conflict
  useEffect(() => {
    if (emailConflictInfo) {
      setShowEmailWaasPinInput(false)
    }
  }, [emailConflictInfo])

  return (
    <Box padding="4">
      <Box
        justifyContent="center"
        color="text100"
        alignItems="center"
        fontWeight="medium"
        style={{
          marginTop: '4px'
        }}
      >
        <TitleWrapper isPreview={isPreview}>
          <Text variant="normal">{isLoading ? `Connecting...` : `Sign in ${projectName ? `to ${projectName}` : ''}`}</Text>
        </TitleWrapper>
      </Box>

      {isLoading ? (
        <Box justifyContent="center" alignItems="center" paddingTop="4">
          <Spinner />
        </Box>
      ) : (
        <>
          {showEmailWaasPinInput ? (
            <EmailWaasVerify error={emailAuthError} isLoading={emailAuthLoading} onConfirm={sendChallengeAnswer} />
          ) : showExtendedList ? (
            <>
              <Box position="absolute" top="4">
                <IconButton icon={ChevronLeftIcon} onClick={() => setShowExtendedList(false)} size="xs" />
              </Box>
              <ExtendedWalletList connectors={walletConnectors} onConnect={onConnect} />
            </>
          ) : (
            <>
              <Banner config={config as KitConfig} />

              <Box marginTop="6">
                {!hasConnectedSocialWallet && emailConnector && (showEmailInput || isEmailOnly) ? (
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
                    {socialAuthConnectors.length > 0 && !hasConnectedSocialWallet && (
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
                    {socialAuthConnectors.length > 0 && !hasConnectedSocialWallet && (
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
          )}
        </>
      )}
    </Box>
  )
}

const TitleWrapper = ({ children, isPreview }: { children: React.ReactNode; isPreview: boolean }) => {
  if (isPreview) {
    return <>{children}</>
  }

  return <ModalPrimitive.Title asChild>{children}</ModalPrimitive.Title>
}
