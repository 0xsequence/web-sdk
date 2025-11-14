'use client'

import { sequence } from '0xsequence'
import { Modal, ToastProvider, type Theme } from '@0xsequence/design-system'
import { SequenceHooksProvider } from '@0xsequence/hooks'
import { SequenceClient } from '@0xsequence/provider'
import { AnimatePresence } from 'motion/react'
import React, { useEffect, useState } from 'react'
import { useAccount, useConfig, useConnections, type Connector } from 'wagmi'

import { DEFAULT_SESSION_EXPIRATION, LocalStorageKey, WEB_SDK_VERSION } from '../../constants/index.js'
import { AnalyticsContextProvider } from '../../contexts/Analytics.js'
import { ConnectConfigContextProvider } from '../../contexts/ConnectConfig.js'
import { ConnectModalContextProvider } from '../../contexts/ConnectModal.js'
import { SocialLinkContextProvider } from '../../contexts/SocialLink.js'
import { ThemeContextProvider } from '../../contexts/Theme.js'
import { WalletConfigContextProvider } from '../../contexts/WalletConfig.js'
import { useStorage } from '../../hooks/useStorage.js'
import { type ConnectConfig, type DisplayedAsset, type EthAuthSettings, type ModalPosition } from '../../types.js'
import { getModalPositionCss } from '../../utils/styling.js'
import { Connect } from '../Connect/Connect.js'
import { ShadowRoot } from '../ShadowRoot/index.js'

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
    disableAnalytics = false,
    hideExternalConnectOptions = false,
    hideConnectedWallets = false,
    hideSocialConnectOptions = false,
    customCSS
  } = config

  const defaultAppName = signIn.projectName || 'app'

  const { expiry = DEFAULT_SESSION_EXPIRATION, app = defaultAppName, origin, nonce } = ethAuth

  const [openConnectModal, setOpenConnectModal] = useState<boolean>(false)
  const [theme, setTheme] = useState<Exclude<Theme, undefined>>(defaultTheme || 'dark')
  const [modalPosition, setModalPosition] = useState<ModalPosition>(position)
  const [displayedAssets, setDisplayedAssets] = useState<DisplayedAsset[]>(displayedAssetsSetting)
  const [analytics, setAnalytics] = useState<SequenceClient['analytics']>()
  const { address, isConnected } = useAccount()

  const storage = useStorage()

  const [isWalletWidgetOpen, setIsWalletWidgetOpen] = useState<boolean>(false)

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

  const setupAnalytics = (projectAccessKey: string) => {
    const s = sequence.initWallet(projectAccessKey)
    const sequenceAnalytics = s.client.analytics

    if (sequenceAnalytics) {
      type TrackArgs = Parameters<typeof sequenceAnalytics.track>
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
          <ConnectModalContextProvider
            value={{ isConnectModalOpen: openConnectModal, setOpenConnectModal, openConnectModalState: openConnectModal }}
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
                <ToastProvider>
                  {/* TODO: either remove SocialLinkContextProvider or figure out what to do for waasConfigKey */}
                  <SocialLinkContextProvider value={{ isSocialLinkOpen, waasConfigKey: '', setIsSocialLinkOpen }}>
                    <ShadowRoot theme={theme} customCSS={customCSS}>
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
                            <Connect onClose={() => setOpenConnectModal(false)} {...props} />
                          </Modal>
                        )}
                      </AnimatePresence>
                    </ShadowRoot>
                    {children}
                  </SocialLinkContextProvider>
                </ToastProvider>
              </AnalyticsContextProvider>
            </WalletConfigContextProvider>
          </ConnectModalContextProvider>
        </ThemeContextProvider>
      </ConnectConfigContextProvider>
    </SequenceHooksProvider>
  )
}
