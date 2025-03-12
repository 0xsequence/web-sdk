'use client'

import { sequence } from '0xsequence'
import { Button, Card, Collapsible, Modal, ModalPrimitive, Text, Theme } from '@0xsequence/design-system'
import { ChainId } from '@0xsequence/network'
import { SequenceClient } from '@0xsequence/provider'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ethers } from 'ethers'
import { AnimatePresence } from 'motion/react'
import React, { useState, useEffect } from 'react'
import { Connector, useAccount, useConfig, useConnections } from 'wagmi'

import { DEFAULT_SESSION_EXPIRATION, WEB_SDK_VERSION, LocalStorageKey } from '../../constants'
import { AnalyticsContextProvider } from '../../contexts/Analytics'
import { ConnectConfigContextProvider } from '../../contexts/ConnectConfig'
import { ConnectModalContextProvider } from '../../contexts/ConnectModal'
import { ThemeContextProvider } from '../../contexts/Theme'
import { WalletConfigContextProvider } from '../../contexts/WalletConfig'
import { useStorage } from '../../hooks/useStorage'
import { useWaasConfirmationHandler } from '../../hooks/useWaasConfirmationHandler'
import { useEmailConflict } from '../../hooks/useWaasEmailConflict'
import { ExtendedConnector, DisplayedAsset, EthAuthSettings, ConnectConfig, ModalPosition } from '../../types'
import { getModalPositionCss } from '../../utils/styling'
import { Connect } from '../Connect/Connect'
import { NetworkBadge } from '../NetworkBadge'
import { PageHeading } from '../PageHeading'
import { PoweredBySequence } from '../SequenceLogo'
import { ShadowRoot } from '../ShadowRoot'
import { TxnDetails } from '../TxnDetails'

export type SequenceConnectProviderProps = {
  children: React.ReactNode
  config: ConnectConfig
}

export const SequenceConnectProvider = (props: SequenceConnectProviderProps) => {
  const { config, children } = props
  const {
    defaultTheme = 'dark',
    signIn = {},
    position = 'center',
    displayedAssets: displayedAssetsSetting = [],
    readOnlyNetworks,
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

    if (sequenceAnalytics) {
      type TrackArgs = Parameters<typeof sequenceAnalytics.track>
      const originalTrack = sequenceAnalytics.track
      sequenceAnalytics.track = (...args: TrackArgs) => {
        const [event] = args
        if (event && typeof event === 'object' && 'props' in event) {
          event.props = {
            ...event.props,
            sdkType: 'sequence kit',
            version: WEB_SDK_VERSION
          }
        }
        return originalTrack?.(...args)
      }
    }
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
    <ConnectConfigContextProvider value={config}>
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
            <WalletConfigContextProvider value={{ setDisplayedAssets, displayedAssets, readOnlyNetworks }}>
              <AnalyticsContextProvider value={{ setAnalytics, analytics }}>
                <ShadowRoot theme={theme}>
                  <AnimatePresence>
                    {openConnectModal && (
                      <Modal
                        scroll={false}
                        size="sm"
                        contentProps={{
                          style: {
                            maxWidth: '390px',
                            overflow: 'visible',
                            ...getModalPositionCss(position)
                          }
                        }}
                        onClose={() => setOpenConnectModal(false)}
                      >
                        <Connect onClose={() => setOpenConnectModal(false)} emailConflictInfo={emailConflictInfo} {...props} />
                      </Modal>
                    )}

                    {pendingRequestConfirmation && (
                      <Modal
                        scroll={false}
                        size="sm"
                        contentProps={{
                          style: {
                            maxWidth: '390px',
                            ...getModalPositionCss(position)
                          }
                        }}
                        isDismissible={false}
                        onClose={() => {
                          rejectPendingRequest('')
                        }}
                      >
                        <div className="px-4 pt-4 pb-2">
                          <div
                            className="flex flex-col justify-center text-primary items-center font-medium"
                            style={{
                              marginTop: '4px'
                            }}
                          >
                            <ModalPrimitive.Title asChild>
                              <Text className="mb-5" variant="large" asChild>
                                <h1>
                                  Confirm {pendingRequestConfirmation.type === 'signMessage' ? 'signing message' : 'transaction'}
                                </h1>
                              </Text>
                            </ModalPrimitive.Title>

                            {pendingRequestConfirmation.type === 'signMessage' && (
                              <div className="flex flex-col w-full">
                                <Text variant="normal" color="muted" fontWeight="medium">
                                  Message
                                </Text>
                                <Card className="mt-2 py-6">
                                  <Text className="mb-4" variant="normal">
                                    {ethers.toUtf8String(pendingRequestConfirmation.message ?? '')}
                                  </Text>
                                </Card>
                              </div>
                            )}

                            {pendingRequestConfirmation.type === 'signTransaction' && (
                              <div className="flex flex-col w-full">
                                <TxnDetails
                                  address={address ?? ''}
                                  txs={pendingRequestConfirmation.txs ?? []}
                                  chainId={pendingRequestConfirmation.chainId ?? ChainId.POLYGON}
                                />

                                <Collapsible className="mt-4" label="Transaction data">
                                  <Card className="overflow-x-scroll my-3">
                                    <Text className="mb-4" variant="code">
                                      {JSON.stringify(pendingRequestConfirmation.txs, null, 2)}
                                    </Text>
                                  </Card>
                                </Collapsible>
                              </div>
                            )}

                            {pendingRequestConfirmation.chainId && (
                              <div className="flex w-full mt-3 justify-end items-center">
                                <div className="flex w-1/2 justify-start">
                                  <Text variant="small" color="muted">
                                    Network
                                  </Text>
                                </div>
                                <div className="flex w-1/2 justify-end">
                                  <NetworkBadge chainId={pendingRequestConfirmation.chainId} />
                                </div>
                              </div>
                            )}

                            <div className="flex flex-row gap-2 w-full mt-5">
                              <Button
                                className="w-full"
                                shape="square"
                                size="lg"
                                label="Reject"
                                onClick={() => {
                                  rejectPendingRequest(pendingRequestConfirmation?.id)
                                }}
                              />
                              <Button
                                className="flex items-center text-center w-full"
                                shape="square"
                                size="lg"
                                label="Confirm"
                                variant="primary"
                                onClick={() => {
                                  confirmPendingRequest(pendingRequestConfirmation?.id)
                                }}
                              />
                            </div>
                          </div>

                          <PoweredBySequence />
                        </div>
                      </Modal>
                    )}

                    {isEmailConflictOpen && emailConflictInfo && (
                      <Modal
                        size="sm"
                        scroll={false}
                        onClose={() => {
                          setOpenConnectModal(false)
                          toggleEmailConflictModal(false)
                        }}
                      >
                        <div className="p-4">
                          <ModalPrimitive.Title asChild>
                            <PageHeading>Email already in use</PageHeading>
                          </ModalPrimitive.Title>
                          <div>
                            <Text className="text-center" variant="normal" color="secondary">
                              Another account with this email address <Text color="primary">({emailConflictInfo.email})</Text>{' '}
                              already exists with account type <Text color="primary">({emailConflictInfo.type})</Text>. Please
                              sign in again with the correct account.
                            </Text>
                            <div className="flex mt-4 gap-2 items-center justify-center">
                              <Button
                                label="OK"
                                onClick={() => {
                                  setOpenConnectModal(false)
                                  toggleEmailConflictModal(false)
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </Modal>
                    )}
                  </AnimatePresence>
                </ShadowRoot>
                {children}
              </AnalyticsContextProvider>
            </WalletConfigContextProvider>
          </ConnectModalContextProvider>
        </GoogleOAuthProvider>
      </ThemeContextProvider>
    </ConnectConfigContextProvider>
  )
}
