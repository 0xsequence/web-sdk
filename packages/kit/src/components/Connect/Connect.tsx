'use client'

import {
  ArrowRightIcon,
  Box,
  Divider,
  Text,
  TextInput,
  Spinner,
  Image,
  IconButton,
  ModalPrimitive
} from '@0xsequence/design-system'
import { genUserId } from '@databeat/tracker'
import React, { useState, useEffect } from 'react'
import { appleAuthHelpers, useScript } from 'react-apple-signin-auth'
import { useConnect, useConnections, useSignMessage } from 'wagmi'

import { LocalStorageKey } from '../../constants'
import { CHAIN_ID_FOR_SIGNATURE } from '../../constants/walletLinking'
import { useAnalyticsContext } from '../../contexts/Analytics'
import { useKitWallets } from '../../hooks/useKitWallets'
import { useStorage } from '../../hooks/useStorage'
import { useEmailAuth } from '../../hooks/useWaasEmailAuth'
import { FormattedEmailConflictInfo } from '../../hooks/useWaasEmailConflict'
import { useWaasLinkWallet } from '../../hooks/useWaasLinkWallet'
import { ExtendedConnector, KitConfig, LogoProps } from '../../types'
import { isEmailValid } from '../../utils/helpers'
import { AppleWaasConnectButton, ConnectButton, GoogleWaasConnectButton, ShowAllWalletsButton } from '../ConnectButton'
import { KitConnectProviderProps } from '../KitProvider/KitProvider'
import { PoweredBySequence } from '../SequenceLogo'

import { Banner } from './Banner'
import { ConnectedWallets } from './ConnectedWallets'
import { EmailWaasVerify } from './EmailWaasVerify'
import { ExtendedWalletList } from './ExtendedWalletList'

const MAX_ITEM_PER_ROW = 4
export const SEQUENCE_UNIVERSAL_CONNECTOR_NAME = 'Sequence'

interface ConnectWalletContentProps extends KitConnectProviderProps {
  emailConflictInfo?: FormattedEmailConflictInfo | null
  onClose: () => void
  isPreview?: boolean
}

export const Connect = (props: ConnectWalletContentProps) => {
  useScript(appleAuthHelpers.APPLE_SCRIPT_SRC)

  const { analytics } = useAnalyticsContext()

  const { onClose, emailConflictInfo, config = {} as KitConfig, isPreview = false } = props
  const { signIn = {} } = config
  const storage = useStorage()

  const descriptiveSocials = !!config?.signIn?.descriptiveSocials
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const projectName = config?.signIn?.projectName

  const [email, setEmail] = useState('')
  const [showEmailWaasPinInput, setShowEmailWaasPinInput] = useState(false)

  const [showExtendedList, setShowExtendedList] = useState<null | 'social' | 'wallet'>(null)
  const { status, connectors, connect } = useConnect()
  const connections = useConnections()
  const { signMessageAsync } = useSignMessage()
  const { wallets, linkedWallets, disconnectWallet, refetchLinkedWallets } = useKitWallets()

  const hasInjectedSequenceConnector = connectors.some(c => c.id === 'app.sequence')

  const hasConnectedSequenceUniversal = connections.some(c => c.connector.name === SEQUENCE_UNIVERSAL_CONNECTOR_NAME)
  const hasConnectedSocialOrSequenceUniversal =
    connections.some(c => (c.connector as ExtendedConnector)?._wallet?.type === 'social') || hasConnectedSequenceUniversal

  const waasConnection = connections.find(c => (c.connector as ExtendedConnector)?.type === 'sequence-waas')

  // Setup wallet linking
  const { linkWallet, removeLinkedWallet } = useWaasLinkWallet(waasConnection?.connector)

  const [lastConnectedWallet, setLastConnectedWallet] = useState<`0x${string}` | undefined>(undefined)
  const [isSigningLinkMessage, setIsSigningLinkMessage] = useState(false)

  const handleUnlinkWallet = async (address: string) => {
    try {
      await removeLinkedWallet(address)

      const parentWallet = wallets.find(w => w.isEmbedded)?.address

      try {
        analytics?.track({
          event: 'UNLINK_WALLET',
          props: {
            parentWalletAddress: parentWallet ? getUserIdForEvent(parentWallet) : '',
            linkedWalletAddress: getUserIdForEvent(address),
            linkedWalletType: linkedWallets?.find(lw => lw.linkedWalletAddress === address)?.walletType || '',
            source: 'sequence-kit/core'
          }
        })
      } catch (e) {
        console.warn('unlink analytics error:', e)
      }

      refetchLinkedWallets()
    } catch (e) {
      console.warn('unlink error:', e)
    }
  }

  useEffect(() => {
    if (!lastConnectedWallet) {
      return
    }
    const tryLinkWallet = async () => {
      const nonWaasWallets = connections.filter(c => (c.connector as ExtendedConnector)?.type !== 'sequence-waas')

      const nonLinkedWallets = nonWaasWallets.filter(
        c => !linkedWallets?.find(lw => lw.linkedWalletAddress === c.accounts[0].toLowerCase())
      )

      if (nonLinkedWallets.map(w => w.accounts[0]).includes(lastConnectedWallet as `0x${string}`)) {
        const waasWalletAddress = waasConnection?.accounts[0]

        if (!waasWalletAddress) {
          return
        }

        const childWalletAddress = lastConnectedWallet
        const childMessage = `Link to parent wallet with address ${waasWalletAddress}`

        setIsSigningLinkMessage(true)
        let childSignature
        try {
          childSignature = await signMessageAsync({ account: lastConnectedWallet, message: childMessage })

          if (!childSignature) {
            return
          }

          await linkWallet({
            signatureChainId: CHAIN_ID_FOR_SIGNATURE,
            connectorName: connections.find(c => c.accounts[0] === lastConnectedWallet)?.connector?.name || '',
            childWalletAddress,
            childMessage,
            childSignature
          })

          try {
            analytics?.track({
              event: 'LINK_WALLET',
              props: {
                parentWalletAddress: getUserIdForEvent(waasWalletAddress),
                linkedWalletAddress: getUserIdForEvent(childWalletAddress),
                linkedWalletType: connections.find(c => c.accounts[0] === lastConnectedWallet)?.connector?.name || '',
                source: 'sequence-kit/core'
              }
            })
          } catch (e) {
            console.warn('link analytics error:', e)
          }

          refetchLinkedWallets()
        } catch (e) {
          console.log(e)
        }
      }

      setIsSigningLinkMessage(false)
      setLastConnectedWallet(undefined)
      onClose()
    }
    if (connections && connections.length > 1 && waasConnection !== undefined) {
      tryLinkWallet()
    } else {
      setLastConnectedWallet(undefined)
      onClose()
    }
  }, [connections, lastConnectedWallet])

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

  const socialAuthConnectors = (connectors as ExtendedConnector[])
    .filter(c => c._wallet?.type === 'social')
    .filter(c => !c._wallet.id.includes('email'))
  const walletConnectors = [...baseWalletConnectors, ...injectedConnectors].filter(c =>
    hasConnectedSequenceUniversal ? c.name !== SEQUENCE_UNIVERSAL_CONNECTOR_NAME : true
  )
  const emailConnector = (connectors as ExtendedConnector[]).find(c => c._wallet.id.includes('email'))

  const onChangeEmail: React.ChangeEventHandler<HTMLInputElement> = ev => {
    setEmail(ev.target.value)
  }

  useEffect(() => {
    setIsLoading(status === 'pending' || status === 'success')
  }, [status])

  const handleConnect = async (connector: ExtendedConnector) => {
    connect(
      { connector },
      {
        onSettled: result => {
          setLastConnectedWallet(result?.accounts[0])
        }
      }
    )
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
          await sendEmailCode()
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
    sendChallengeAnswer,
    resetError
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

  const sendEmailCode = async () => {
    await initiateEmailAuth(email)
  }

  // Hide the email input if there is an email conflict
  useEffect(() => {
    if (emailConflictInfo) {
      setShowEmailWaasPinInput(false)
    }
  }, [emailConflictInfo])

  const showSocialConnectorSection = socialAuthConnectors.length > 0
  const showEmailInputSection = !!emailConnector

  const showMoreSocialOptions = socialAuthConnectors.length > MAX_ITEM_PER_ROW
  const showMoreWalletOptions = walletConnectors.length > MAX_ITEM_PER_ROW
  const socialConnectorsPerRow = showMoreSocialOptions && !descriptiveSocials ? MAX_ITEM_PER_ROW - 1 : socialAuthConnectors.length
  const walletConnectorsPerRow = showMoreWalletOptions ? MAX_ITEM_PER_ROW - 1 : walletConnectors.length

  if (showExtendedList) {
    const SEARCHABLE_TRESHOLD = 8
    const connectors = showExtendedList === 'social' ? socialAuthConnectors : walletConnectors
    const searchable = connectors.length > SEARCHABLE_TRESHOLD

    return (
      <ExtendedWalletList
        searchable={searchable}
        onGoBack={() => setShowExtendedList(null)}
        onConnect={onConnect}
        connectors={connectors}
        title={showExtendedList === 'social' ? 'Continue with a social account' : 'Choose a wallet'}
      />
    )
  }

  return (
    <Box padding="4">
      <Box
        flexDirection="column"
        justifyContent="center"
        color="text100"
        alignItems="center"
        fontWeight="medium"
        style={{
          marginTop: '4px'
        }}
      >
        <TitleWrapper isPreview={isPreview}>
          <Text color="text80">
            {isLoading
              ? `Connecting...`
              : hasConnectedSocialOrSequenceUniversal
                ? 'Wallets'
                : `Sign in ${projectName ? `to ${projectName}` : ''}`}
          </Text>
        </TitleWrapper>

        {isSigningLinkMessage && (
          <Box marginTop="4">
            <Text variant="small" color="text50">
              Confirm the signature request to link your account
            </Text>
          </Box>
        )}
      </Box>
      {isLoading ? (
        <Box justifyContent="center" alignItems="center" paddingTop="4">
          <Spinner />
        </Box>
      ) : (
        <>
          {wallets.length > 0 && !showEmailWaasPinInput && (
            <>
              <ConnectedWallets
                wallets={wallets}
                linkedWallets={linkedWallets}
                disconnectWallet={disconnectWallet}
                unlinkWallet={handleUnlinkWallet}
              />

              <>
                <Divider color="backgroundRaised" width="full" />
                <Box justifyContent="center">
                  <Text variant="small" color="text50">
                    {!hasConnectedSocialOrSequenceUniversal ? 'Connect with a social account' : 'Connect another wallet'}
                  </Text>
                </Box>
              </>
            </>
          )}
          {showEmailWaasPinInput ? (
            <EmailWaasVerify
              sendEmailCode={sendEmailCode}
              error={emailAuthError}
              isLoading={emailAuthLoading}
              onConfirm={sendChallengeAnswer}
              resetError={resetError}
            />
          ) : (
            <>
              {!hasConnectedSocialOrSequenceUniversal && (
                <>
                  <Banner config={config as KitConfig} />

                  <Box marginTop="6" gap="6" flexDirection="column">
                    <>
                      {showSocialConnectorSection && (
                        <Box
                          gap="2"
                          flexDirection={descriptiveSocials ? 'column' : 'row'}
                          justifyContent="center"
                          alignItems="center"
                        >
                          {socialAuthConnectors.slice(0, socialConnectorsPerRow).map(connector => {
                            return (
                              <Box key={connector.uid} width="full">
                                {connector._wallet.id === 'google-waas' ? (
                                  <GoogleWaasConnectButton
                                    isDescriptive={descriptiveSocials}
                                    connector={connector}
                                    onConnect={onConnect}
                                  />
                                ) : connector._wallet.id === 'apple-waas' ? (
                                  <AppleWaasConnectButton
                                    isDescriptive={descriptiveSocials}
                                    connector={connector}
                                    onConnect={onConnect}
                                  />
                                ) : (
                                  <ConnectButton isDescriptive={descriptiveSocials} connector={connector} onConnect={onConnect} />
                                )}
                              </Box>
                            )
                          })}
                          {showMoreSocialOptions && (
                            <Box width="full">
                              <ShowAllWalletsButton onClick={() => setShowExtendedList('social')} />
                            </Box>
                          )}
                        </Box>
                      )}
                      {showSocialConnectorSection && showEmailInputSection && (
                        <Box gap="4" flexDirection="row" justifyContent="center" alignItems="center">
                          <Divider marginX="0" marginY="0" color="backgroundSecondary" flexGrow="1" />
                          <Text lineHeight="4" height="4" variant="normal" fontSize="small" fontWeight="medium" color="text50">
                            or
                          </Text>
                          <Divider marginX="0" marginY="0" color="backgroundSecondary" flexGrow="1" />
                        </Box>
                      )}
                      {showEmailInputSection && (
                        <>
                          <form onSubmit={onConnectInlineEmail}>
                            <TextInput
                              autoFocus
                              onChange={onChangeEmail}
                              value={email}
                              name="email"
                              placeholder="Email address"
                              controls={
                                <>
                                  {emailAuthInProgress ? (
                                    <Spinner />
                                  ) : (
                                    <IconButton
                                      type="submit"
                                      variant={!isEmailValid(email) ? 'glass' : 'primary'}
                                      size="xs"
                                      icon={ArrowRightIcon}
                                      disabled={!isEmailValid(email)}
                                    />
                                  )}
                                </>
                              }
                              data-1p-ignore
                            />
                          </form>
                        </>
                      )}
                    </>
                  </Box>
                </>
              )}
              {walletConnectors.length > 0 && (
                <>
                  <Box
                    gap="2"
                    flexDirection="row"
                    justifyContent="center"
                    alignItems="center"
                    marginTop={hasConnectedSocialOrSequenceUniversal ? '4' : '6'}
                  >
                    {walletConnectors.slice(0, walletConnectorsPerRow).map(connector => {
                      return <ConnectButton key={connector.uid} connector={connector} onConnect={onConnect} />
                    })}
                    {showMoreWalletOptions && <ShowAllWalletsButton onClick={() => setShowExtendedList('wallet')} />}
                  </Box>
                </>
              )}
              <Box marginTop="6">
                <PoweredBySequence />
              </Box>
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

const getUserIdForEvent = (address: string) => {
  return genUserId(address.toLowerCase(), false, { privacy: { userIdHash: true } }).userId
}
