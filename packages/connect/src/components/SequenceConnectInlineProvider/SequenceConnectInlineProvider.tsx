'use client'

import { Button, Card, Modal, ModalPrimitive, Spinner, Text, ThemeProvider, type Theme } from '@0xsequence/design-system'
import { SequenceHooksProvider } from '@0xsequence/hooks'
import { ChainId } from '@0xsequence/network'
import { SequenceClient, setupAnalytics, type Analytics } from '@0xsequence/provider'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AnimatePresence } from 'motion/react'
import React, { useEffect, useState, type ReactNode } from 'react'
import { hexToString, type Hex } from 'viem'
import { useConfig, useConnection, useConnections, type Connector } from 'wagmi'

import { DEFAULT_SESSION_EXPIRATION, LocalStorageKey, WEB_SDK_VERSION } from '../../constants/index.js'
import { AnalyticsContextProvider } from '../../contexts/Analytics.js'
import { ConnectConfigContextProvider } from '../../contexts/ConnectConfig.js'
import { ConnectModalContextProvider } from '../../contexts/ConnectModal.js'
import { SocialLinkContextProvider } from '../../contexts/SocialLink.js'
import { ThemeContextProvider } from '../../contexts/Theme.js'
import { WalletConfigContextProvider } from '../../contexts/WalletConfig.js'
import { useResolvedConnectConfig } from '../../hooks/useResolvedConnectConfig.js'
import { useStorage } from '../../hooks/useStorage.js'
import { useSyncWagmiChains } from '../../hooks/useSyncWagmiChains.js'
import { useWaasConfirmationHandler } from '../../hooks/useWaasConfirmationHandler.js'
import { useEmailConflict } from '../../hooks/useWaasEmailConflict.js'
import { styleProperties } from '../../styleProperties.js'
import { styles } from '../../styles.js'
import {
  type ConnectConfig,
  type DisplayedAsset,
  type EthAuthSettings,
  type ExtendedConnector,
  type ModalPosition
} from '../../types.js'
import { isJSON } from '../../utils/helpers.js'
import { getModalPositionCss } from '../../utils/styling.js'
import { Connect } from '../Connect/Connect.js'
import { EpicAuthProvider } from '../EpicAuthProvider/index.js'
import { JsonTreeViewer } from '../JsonTreeViewer.js'
import { NetworkBadge } from '../NetworkBadge/index.js'
import { PageHeading } from '../PageHeading/index.js'
import { PoweredBySequence } from '../SequenceLogo/index.js'
import { ShadowRoot } from '../ShadowRoot/index.js'
import { SocialLink } from '../SocialLink/SocialLink.js'
import { TxnDetails } from '../TxnDetails/index.js'

export type SequenceConnectInlineProviderProps = {
  children: ReactNode
  config: ConnectConfig
}

const resolveInlineBackground = (theme: Theme | undefined) => {
  if (theme && typeof theme === 'object' && 'colors' in theme) {
    const background = (theme as any).colors?.backgroundPrimary
    if (background) {
      return background as string
    }
  }

  if (typeof theme === 'string') {
    return theme === 'light' ? '#f6f6f6' : '#000'
  }

  return '#000'
}

/**
 * Inline version of SequenceConnectProvider component.
 * This component renders the connect UI inline within your layout instead of in a modal.
 * Ideal for embedded wallet experiences or custom layouts.
 */
export const SequenceConnectInlineProvider = (props: SequenceConnectInlineProviderProps) => {
  const { config: incomingConfig, children } = props
  const {
    resolvedConfig: config,
    isLoading: isWalletConfigLoading,
    enabledProviders,
    isV3WalletSignedIn,
    isAuthStatusLoading,
    walletConfigurationSignIn
  } = useResolvedConnectConfig(incomingConfig)

  const {
    defaultTheme = 'dark',
    signIn = {},
    position = 'center',
    displayedAssets: displayedAssetsSetting = [],
    readOnlyNetworks,
    ethAuth = {} as EthAuthSettings,
    disableAnalytics = false,
    hideExternalConnectOptions = false,
    hideConnectedWallets = false,
    hideSocialConnectOptions = false,
    customCSS,
    waasConfigKey = ''
  } = config

  const defaultAppName = signIn.projectName || 'app'

  const { expiry = DEFAULT_SESSION_EXPIRATION, app = defaultAppName, origin, nonce } = ethAuth

  const [theme, setTheme] = useState<Exclude<Theme, undefined>>(defaultTheme || 'dark')
  const [modalPosition, setModalPosition] = useState<ModalPosition>(position)
  const [displayedAssets, setDisplayedAssets] = useState<DisplayedAsset[]>(displayedAssetsSetting)
  const [analytics, setAnalytics] = useState<SequenceClient['analytics']>()
  const { address, isConnected } = useConnection()
  const wagmiConfig = useConfig()
  useSyncWagmiChains(config, wagmiConfig)
  const storage = useStorage()
  const connections = useConnections()
  const waasConnector: Connector | undefined = connections.find(c => c.connector.id.includes('waas'))?.connector

  const [isWalletWidgetOpen, setIsWalletWidgetOpen] = useState<boolean>(false)

  const inlineBackground = resolveInlineBackground(theme)

  useEffect(() => {
    const handleWalletModalStateChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ open: boolean }>
      setIsWalletWidgetOpen(customEvent.detail.open)
    }

    window.addEventListener('sequence:wallet-modal-state-change', handleWalletModalStateChange)

    return () => {
      window.removeEventListener('sequence:wallet-modal-state-change', handleWalletModalStateChange)
    }
  }, [])

  const [pendingRequestConfirmation, confirmPendingRequest, rejectPendingRequest] = useWaasConfirmationHandler(
    waasConnector,
    !isWalletWidgetOpen
  )

  const googleWaasConnector = wagmiConfig.connectors.find(
    c => c.id === 'sequence-waas' && (c as ExtendedConnector)._wallet.id === 'google-waas'
  ) as ExtendedConnector | undefined
  const googleClientId: string = (googleWaasConnector as any)?.params?.googleClientId || ''

  const getAnalyticsClient = (projectAccessKey: string) => {
    // @ts-ignore-next-line
    const sequenceAnalytics = setupAnalytics(projectAccessKey) as Analytics

    type TrackArgs = Parameters<Analytics['track']>
    const originalTrack = sequenceAnalytics.track.bind(sequenceAnalytics)

    sequenceAnalytics.track = (...args: TrackArgs) => {
      const [event] = args
      if (event && typeof event === 'object' && 'props' in event) {
        event.props = {
          ...event.props,
          sdkType: 'sequence web sdk',
          version: WEB_SDK_VERSION
        }
      }
      return originalTrack?.(...args)
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
      getAnalyticsClient(config.projectAccessKey)
    }
  }, [disableAnalytics, config.projectAccessKey])

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
    setDisplayedAssets(displayedAssetsSetting)
  }, [displayedAssetsSetting])

  const { isEmailConflictOpen, emailConflictInfo, toggleEmailConflictModal } = useEmailConflict()

  const [isSocialLinkOpen, setIsSocialLinkOpen] = useState<boolean>(false)

  return (
    <SequenceHooksProvider
      config={{
        projectAccessKey: config.projectAccessKey,
        env: config.env
      }}
    >
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
            <ConnectModalContextProvider
              value={{ isConnectModalOpen: false, setOpenConnectModal: () => {}, openConnectModalState: false }}
            >
              <WalletConfigContextProvider
                value={{
                  setDisplayedAssets,
                  displayedAssets,
                  readOnlyNetworks,
                  hideExternalConnectOptions,
                  hideConnectedWallets,
                  hideSocialConnectOptions
                }}
              >
                <AnalyticsContextProvider value={{ setAnalytics, analytics }}>
                  <SocialLinkContextProvider value={{ isSocialLinkOpen, waasConfigKey, setIsSocialLinkOpen }}>
                    <EpicAuthProvider>
                      <div id="kit-provider" className="h-full w-full flex flex-col" style={{ background: inlineBackground }}>
                        <style>{styles + styleProperties + (customCSS ? `\n\n${customCSS}` : '')}</style>
                        <ThemeProvider root="#kit-provider" scope="kit" theme={theme}>
                          {isWalletConfigLoading || isAuthStatusLoading ? (
                            <div className="flex py-8 justify-center items-center">
                              <Spinner size="lg" />
                            </div>
                          ) : (
                            <Connect
                              onClose={() => {}}
                              emailConflictInfo={emailConflictInfo}
                              isInline
                              {...props}
                              config={incomingConfig}
                              resolvedConfig={config}
                              isV3WalletSignedIn={isV3WalletSignedIn}
                              isAuthStatusLoading={isAuthStatusLoading}
                              enabledProviders={enabledProviders}
                              walletConfigurationSignIn={walletConfigurationSignIn}
                            />
                          )}
                        </ThemeProvider>
                      </div>

                      <ShadowRoot theme={theme} customCSS={customCSS}>
                        <AnimatePresence>
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
                                        Confirm{' '}
                                        {pendingRequestConfirmation.type === 'signMessage' ? 'signing message' : 'transaction'}
                                      </h1>
                                    </Text>
                                  </ModalPrimitive.Title>

                                  {pendingRequestConfirmation.type === 'signMessage' && pendingRequestConfirmation.message && (
                                    <div className="flex flex-col w-full">
                                      <Text variant="normal" color="muted" fontWeight="medium">
                                        Message
                                      </Text>
                                      <Card className="mt-2 py-2 overflow-scroll max-h-[200px]">
                                        <Text className="mb-4" variant="normal">
                                          {isJSON(pendingRequestConfirmation.message) ? (
                                            <JsonTreeViewer data={JSON.parse(pendingRequestConfirmation.message)} />
                                          ) : (
                                            hexToString(pendingRequestConfirmation.message as unknown as Hex)
                                          )}
                                        </Text>
                                      </Card>
                                    </div>
                                  )}

                                  {pendingRequestConfirmation.type === 'signTransaction' && (
                                    <TxnDetails
                                      address={address ?? ''}
                                      txs={pendingRequestConfirmation.txs ?? []}
                                      chainId={pendingRequestConfirmation.chainId ?? ChainId.POLYGON}
                                    />
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

                                <div className="mt-4">
                                  <PoweredBySequence />
                                </div>
                              </div>
                            </Modal>
                          )}

                          {isEmailConflictOpen && emailConflictInfo && (
                            <Modal
                              size="sm"
                              scroll={false}
                              onClose={() => {
                                toggleEmailConflictModal(false)
                              }}
                            >
                              <div className="p-4">
                                <ModalPrimitive.Title asChild>
                                  <PageHeading>Email already in use</PageHeading>
                                </ModalPrimitive.Title>
                                <div>
                                  <Text className="text-center" variant="normal" color="secondary">
                                    Another account with this email address{' '}
                                    <Text color="primary">({emailConflictInfo.email})</Text> already exists with account type{' '}
                                    <Text color="primary">({emailConflictInfo.type})</Text>. Please sign in again with the correct
                                    account.
                                  </Text>
                                  <div className="flex mt-4 gap-2 items-center justify-center">
                                    <Button
                                      label="OK"
                                      onClick={() => {
                                        toggleEmailConflictModal(false)
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </Modal>
                          )}

                          {isSocialLinkOpen &&
                            (waasConnector ? (
                              <Modal size="sm" scroll={false} onClose={() => setIsSocialLinkOpen(false)}>
                                <SocialLink />
                              </Modal>
                            ) : (
                              <Modal size="sm" scroll={false} onClose={() => setIsSocialLinkOpen(false)}>
                                <Text className="p-8" variant="medium" color="warning">
                                  Social link is not supported for universal wallets (works only for embedded wallets)
                                </Text>
                              </Modal>
                            ))}
                        </AnimatePresence>
                      </ShadowRoot>
                    </EpicAuthProvider>
                    {children}
                  </SocialLinkContextProvider>
                </AnalyticsContextProvider>
              </WalletConfigContextProvider>
            </ConnectModalContextProvider>
          </GoogleOAuthProvider>
        </ThemeContextProvider>
      </ConnectConfigContextProvider>
    </SequenceHooksProvider>
  )
}
