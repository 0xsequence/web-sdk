import React, { useState, useEffect } from 'react'
import type { ComponentProps } from 'react'
import { sequence } from '0xsequence'

import { Box, Modal, Text, ThemeProvider } from '@0xsequence/design-system'
import { AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'

import { ConnectWalletContent } from './ConnectWalletContent'
import { SequenceLogo } from './SequenceLogo'
import { DEFAULT_SESSION_EXPIRATION, LocalStorageKey } from '../../constants'
import {
  ConnectModalContextProvider,
  ThemeContextProvider,
  WalletConfigContextProvider,
  AnalyticsContextProvider
} from '../../contexts'
import { ModalPosition, getModalPositionCss } from '../../utils'

import '@0xsequence/design-system/styles.css'

import * as sharedStyles from '../styles.css'
import { SequenceClient } from '0xsequence/dist/declarations/src/provider'

export declare const THEME: readonly ['dark', 'light']
export declare type Theme = Exclude<ComponentProps<typeof ThemeProvider>['theme'], undefined>
export const THEMES = {
  dark: 'dark' as Theme,
  light: 'light' as Theme
}

export interface DisplayedAsset {
  contractAddress: string
  chainId: number
}

export interface EthAuthSettings {
  app?: string
  /** expiry number (in seconds) that is used for ETHAuth proof. Default is 1 week in seconds. */
  expiry?: number
  /** origin hint of the dapp's host opening the wallet. This value will automatically
   * be determined and verified for integrity, and can be omitted. */
  origin?: string
  /** authorizeNonce is an optional number to be passed as ETHAuth's nonce claim for replay protection. **/
  nonce?: number
}

export interface KitConfig {
  disableAnalytics?: boolean
  defaultTheme?: Theme
  position?: ModalPosition
  signIn?: {
    logoUrl?: string
    projectName?: string
    showEmailInput?: boolean
    socialAuthOptions?: string[]
    walletAuthOptions?: string[]
    useMock?: boolean
  }
  displayedAssets?: DisplayedAsset[]
  ethAuth?: EthAuthSettings
}

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

  const { expiry = DEFAULT_SESSION_EXPIRATION, app = defaultAppName, origin = location.origin, nonce } = ethAuth

  const { projectName } = signIn
  const [openConnectModal, setOpenConnectModal] = useState<boolean>(false)
  const [theme, setTheme] = useState<Exclude<Theme, undefined>>(defaultTheme || THEMES.dark)
  const [modalPosition, setModalPosition] = useState<ModalPosition>(position)
  const [displayedAssets, setDisplayedAssets] = useState<DisplayedAsset[]>(displayedAssetsSetting)
  const [analytics, setAnalytics] = useState<SequenceClient['analytics']>()
  const { address, isConnected } = useAccount()

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

  const poweredBySequenceOnClick = () => {
    if (typeof window !== 'undefined') {
      window.open('https://sequence.xyz')
    }
  }

  useEffect(() => {
    const projectAccessKey = localStorage.getItem(LocalStorageKey.ProjectAccessKey) || ''
    if (!disableAnalytics) {
      setupAnalytics(projectAccessKey)
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
    localStorage.setItem(
      LocalStorageKey.EthAuthSettings,
      JSON.stringify({
        expiry,
        app,
        origin,
        nonce
      })
    )
  }, [theme, ethAuth])

  useEffect(() => {
    setDisplayedAssets(displayedAssets)
  }, [displayedAssetsSetting])

  return (
    <ThemeContextProvider
      value={{
        theme,
        setTheme,
        position: modalPosition,
        setPosition: setModalPosition
      }}
    >
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
                      <Box padding="4" className={sharedStyles.walletContent}>
                        <Box
                          justifyContent="center"
                          color="text100"
                          alignItems="center"
                          fontWeight="medium"
                          style={{
                            marginTop: '4px'
                          }}
                        >
                          <Text>Sign in {projectName ? `to ${projectName}` : ''}</Text>
                        </Box>
                        <ConnectWalletContent
                          openConnectModal={openConnectModal}
                          setOpenConnectModal={setOpenConnectModal}
                          {...props}
                        />
                        <Box
                          onClick={poweredBySequenceOnClick}
                          className={sharedStyles.clickable}
                          gap="1"
                          marginTop="2"
                          flexDirection="row"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize="small" color="text100">
                            Powered by Sequence
                          </Text>
                          <Box height="5" width="5">
                            <SequenceLogo />
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
    </ThemeContextProvider>
  )
}
