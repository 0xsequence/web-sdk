'use client'

import { sequence } from '0xsequence'
import { Theme, ThemeProvider } from '@0xsequence/design-system'
import { SequenceClient } from '@0xsequence/provider'
import { GoogleOAuthProvider } from '@react-oauth/google'
import React, { useState, useEffect } from 'react'
import { useAccount, useConfig } from 'wagmi'

import { DEFAULT_SESSION_EXPIRATION, LocalStorageKey } from '../../constants'
import { AnalyticsContextProvider } from '../../contexts/Analytics'
import { ConnectConfigContextProvider } from '../../contexts/ConnectConfig'
import { ConnectModalContextProvider } from '../../contexts/ConnectModal'
import { ThemeContextProvider } from '../../contexts/Theme'
import { WalletConfigContextProvider } from '../../contexts/WalletConfig'
import { useStorage } from '../../hooks/useStorage'
import { useEmailConflict } from '../../hooks/useWaasEmailConflict'
import { ExtendedConnector, DisplayedAsset, EthAuthSettings, ConnectConfig, ModalPosition } from '../../types'
import { Connect } from '../Connect/Connect'

export type SequenceConnectProviderProps = {
  children: React.ReactNode
  config: ConnectConfig
}

export const SequenceConnectPreviewProvider = (props: SequenceConnectProviderProps) => {
  const { config, children } = props
  const {
    defaultTheme = 'dark',
    signIn = {},
    position = 'center',
    displayedAssets: displayedAssetsSetting = [],
    readOnlyNetworks,
    ethAuth = {} as EthAuthSettings,
    disableAnalytics = false,
    showExternalWallets = true,
    showLinkedWallets = true
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

  const { emailConflictInfo } = useEmailConflict()

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
          <ConnectModalContextProvider
            value={{ isConnectModalOpen: openConnectModal, setOpenConnectModal, openConnectModalState: openConnectModal }}
          >
            <WalletConfigContextProvider
              value={{ setDisplayedAssets, displayedAssets, readOnlyNetworks, showExternalWallets, showLinkedWallets }}
            >
              <AnalyticsContextProvider value={{ setAnalytics, analytics }}>
                <div id="kit-provider">
                  <ThemeProvider root="#kit-provider" scope="kit" theme={theme}>
                    <Connect
                      onClose={() => setOpenConnectModal(false)}
                      emailConflictInfo={emailConflictInfo}
                      isPreview
                      {...props}
                    />
                  </ThemeProvider>
                </div>
                {children}
              </AnalyticsContextProvider>
            </WalletConfigContextProvider>
          </ConnectModalContextProvider>
        </GoogleOAuthProvider>
      </ThemeContextProvider>
    </ConnectConfigContextProvider>
  )
}
