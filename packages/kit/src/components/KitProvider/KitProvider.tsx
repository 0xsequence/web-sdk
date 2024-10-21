'use client'

import { sequence } from '0xsequence'
import { Box, Button, Card, Collapsible, Modal, ModalPrimitive, Text, ThemeProvider } from '@0xsequence/design-system'
import { ChainId } from '@0xsequence/network'
import { SequenceClient } from '@0xsequence/provider'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ethers } from 'ethers'
import { AnimatePresence } from 'framer-motion'
import React, { useState, useEffect } from 'react'
import { Connector, useAccount, useConfig, useConnections } from 'wagmi'

import { DEFAULT_SESSION_EXPIRATION, LocalStorageKey } from '../../constants'
import { AnalyticsContextProvider } from '../../contexts/Analytics'
import { ConnectModalContextProvider } from '../../contexts/ConnectModal'
import { KitConfigContextProvider } from '../../contexts/KitConfig'
import { ThemeContextProvider } from '../../contexts/Theme'
import { WalletConfigContextProvider } from '../../contexts/WalletSettings'
import { useStorage } from '../../hooks/useStorage'
import { useWaasConfirmationHandler } from '../../hooks/useWaasConfirmationHandler'
import { useEmailConflict } from '../../hooks/useWaasEmailConflict'
import { ExtendedConnector, DisplayedAsset, EthAuthSettings, KitConfig, Theme, ModalPosition } from '../../types'
import { getModalPositionCss } from '../../utils/styling'
import { ConnectWalletContent } from '../Connect'
import { NetworkBadge } from '../NetworkBadge'
import { PageHeading } from '../PageHeading'
import { PoweredBySequence } from '../SequenceLogo'
import { TxnDetails } from '../TxnDetails'

export type KitConnectProviderProps = {
  children: React.ReactNode
  config: KitConfig
}

export const KitProvider = (props: KitConnectProviderProps) => {
  const { config, children } = props
  const {
    defaultTheme = 'dark',
    signIn = {},
    position = 'center',
    displayedAssets: displayedAssetsSetting = [],
    ethAuth = {} as EthAuthSettings,
    disableAnalytics = false
  } = config

  const defaultAppName = signIn.projectName || 'app'

  const { expiry = DEFAULT_SESSION_EXPIRATION, app = defaultAppName, origin, nonce } = ethAuth

  const [openConnectModal, setOpenConnectModal] = useState<boolean>(false)
  const [theme, setTheme] = useState<Exclude<Theme, undefined>>(defaultTheme || 'dark')
  const [modalPosition, setModalPosition] = useState<ModalPosition>(position)
  const [displayedAssets, setDisplayedAssets] = useState<DisplayedAsset[]>(displayedAssetsSetting)
  const [analytics, setAnalytics] = useState<SequenceClient['analytics']>()
  const { address, isConnected } = useAccount()
  const wagmiConfig = useConfig()
  const storage = useStorage()
  const connections = useConnections()
  const waasConnector: Connector | undefined = connections.find(c => c.connector.id.includes('waas'))?.connector

  const [pendingRequestConfirmation, confirmPendingRequest, rejectPendingRequest] = useWaasConfirmationHandler(waasConnector)

  const googleWaasConnector = wagmiConfig.connectors.find(
    c => c.id === 'sequence-waas' && (c as ExtendedConnector)._wallet.id === 'google-waas'
  ) as ExtendedConnector | undefined
  const googleClientId: string = (googleWaasConnector as any)?.params?.googleClientId || ''

  const setupAnalytics = (projectAccessKey: string) => {
    const s = sequence.initWallet(projectAccessKey)
    const sequenceAnalytics = s.client.analytics
    setAnalytics(sequenceAnalytics)
  }

  useEffect(() => {
    if (!isConnected) {
      analytics?.reset()

      return
    }
    if (address) {
      analytics?.identify(address.toLowerCase())
    }
  }, [analytics, address, isConnected])

  useEffect(() => {
    if (!disableAnalytics) {
      setupAnalytics(config.projectAccessKey)
    }
  }, [])

  useEffect(() => {
    if (theme !== defaultTheme) {
      setTheme(defaultTheme)
    }
  }, [defaultTheme])

  useEffect(() => {
    if (modalPosition !== position) {
      setModalPosition(position)
    }
  }, [position])

  // Write data in local storage for retrieval in connectors
  useEffect(() => {
    // Theme
    // TODO: set the sequence theme once it is added to connect options
    if (typeof theme === 'object') {
      // localStorage.setItem(LocalStorageKey.Theme, JSON.stringify(theme))
    } else {
      localStorage.setItem(LocalStorageKey.Theme, theme)
    }
    // EthAuth
    // note: keep an eye out for potential race-conditions, though they shouldn't occur.
    // If there are race conditions, the settings could be a function executed prior to being passed to wagmi
    storage?.setItem(LocalStorageKey.EthAuthSettings, {
      expiry,
      app,
      origin: origin || location.origin,
      nonce
    })
  }, [theme, ethAuth])

  useEffect(() => {
    setDisplayedAssets(displayedAssets)
  }, [displayedAssetsSetting])

  const { isEmailConflictOpen, emailConflictInfo, toggleEmailConflictModal } = useEmailConflict()

  return (
    <KitConfigContextProvider value={config}>
      <ThemeContextProvider
        value={{
          theme,
          setTheme,
          position: modalPosition,
          setPosition: setModalPosition
        }}
      >
        <GoogleOAuthProvider clientId={googleClientId}>
          <ConnectModalContextProvider value={{ setOpenConnectModal, openConnectModalState: openConnectModal }}>
            <WalletConfigContextProvider value={{ setDisplayedAssets, displayedAssets }}>
              <AnalyticsContextProvider value={{ setAnalytics, analytics }}>
                <div id="kit-provider">
                  <ThemeProvider root="#kit-provider" scope="kit" theme={theme}>
                    <AnimatePresence>
                      {openConnectModal && (
                        <Modal
                          scroll={false}
                          backdropColor="backgroundBackdrop"
                          size="sm"
                          contentProps={{
                            style: {
                              maxWidth: '364px',
                              ...getModalPositionCss(position)
                            }
                          }}
                          onClose={() => setOpenConnectModal(false)}
                        >
                          <ConnectWalletContent
                            onClose={() => setOpenConnectModal(false)}
                            emailConflictInfo={emailConflictInfo}
                            {...props}
                          />
                        </Modal>
                      )}

                      {pendingRequestConfirmation && (
                        <Modal
                          scroll={false}
                          backdropColor="backgroundBackdrop"
                          size="sm"
                          contentProps={{
                            style: {
                              maxWidth: '364px',
                              ...getModalPositionCss(position)
                            }
                          }}
                          isDismissible={false}
                          onClose={() => {
                            rejectPendingRequest('')
                          }}
                        >
                          <Box paddingX="4" paddingTop="4" paddingBottom="2">
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
                              <ModalPrimitive.Title asChild>
                                <Text as="h1" variant="large" marginBottom="5">
                                  Confirm {pendingRequestConfirmation.type === 'signMessage' ? 'signing message' : 'transaction'}
                                </Text>
                              </ModalPrimitive.Title>

                              {pendingRequestConfirmation.type === 'signMessage' && (
                                <Box flexDirection="column" width="full">
                                  <Text variant="normal" color="text50" fontWeight="medium">
                                    Message
                                  </Text>
                                  <Card marginTop="2" paddingY="6">
                                    <Text variant="normal" marginBottom="4">
                                      {ethers.toUtf8String(pendingRequestConfirmation.message ?? '')}
                                    </Text>
                                  </Card>
                                </Box>
                              )}

                              {pendingRequestConfirmation.type === 'signTransaction' && (
                                <Box flexDirection="column" width="full">
                                  <TxnDetails
                                    address={address ?? ''}
                                    txs={pendingRequestConfirmation.txs ?? []}
                                    chainId={pendingRequestConfirmation.chainId ?? ChainId.POLYGON}
                                  />

                                  <Collapsible label="Transaction data" marginTop="4">
                                    <Card overflowX="scroll" marginY="3">
                                      <Text variant="code" marginBottom="4">
                                        {JSON.stringify(pendingRequestConfirmation.txs, null, 2)}
                                      </Text>
                                    </Card>
                                  </Collapsible>
                                </Box>
                              )}

                              {pendingRequestConfirmation.chainId && (
                                <Box width="full" marginTop="3" justifyContent="flex-end" alignItems="center">
                                  <Box width="1/2" justifyContent="flex-start">
                                    <Text variant="small" color="text50">
                                      Network
                                    </Text>
                                  </Box>
                                  <Box width="1/2" justifyContent="flex-end">
                                    <NetworkBadge chainId={pendingRequestConfirmation.chainId} />
                                  </Box>
                                </Box>
                              )}

                              <Box flexDirection="row" gap="2" width="full" marginTop="5">
                                <Button
                                  width="full"
                                  shape="square"
                                  size="lg"
                                  label="Reject"
                                  onClick={() => {
                                    rejectPendingRequest(pendingRequestConfirmation?.id)
                                  }}
                                />
                                <Button
                                  alignItems="center"
                                  textAlign="center"
                                  width="full"
                                  shape="square"
                                  size="lg"
                                  label="Confirm"
                                  variant="primary"
                                  onClick={() => {
                                    confirmPendingRequest(pendingRequestConfirmation?.id)
                                  }}
                                />
                              </Box>
                            </Box>

                            <PoweredBySequence />
                          </Box>
                        </Modal>
                      )}

                      {isEmailConflictOpen && emailConflictInfo && (
                        <Modal size="sm" scroll={false} onClose={() => toggleEmailConflictModal(false)}>
                          <Box padding="4">
                            <ModalPrimitive.Title asChild>
                              <PageHeading>Email already in use</PageHeading>
                            </ModalPrimitive.Title>
                            <Box>
                              <Text variant="normal" color="text80" textAlign="center">
                                Another account with this email address <Text color="text100">({emailConflictInfo.email})</Text>{' '}
                                already exists with account type <Text color="text100">({emailConflictInfo.type})</Text>. Please
                                sign in again with the correct account.
                              </Text>
                              <Box marginTop="4" gap="2" alignItems="center" justifyContent="center">
                                <Button label="OK" onClick={() => toggleEmailConflictModal(false)} />
                              </Box>
                            </Box>
                          </Box>
                        </Modal>
                      )}
                    </AnimatePresence>
                  </ThemeProvider>
                </div>
                {children}
              </AnalyticsContextProvider>
            </WalletConfigContextProvider>
          </ConnectModalContextProvider>
        </GoogleOAuthProvider>
      </ThemeContextProvider>
    </KitConfigContextProvider>
  )
}
