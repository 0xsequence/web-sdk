'use client'

import { ThemeProvider, type Theme } from '@0xsequence/design-system'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useState, type ReactNode } from 'react'
import { useConfig } from 'wagmi'

import { AnalyticsContextProvider } from '../../contexts/Analytics.js'
import { ConnectConfigContextProvider } from '../../contexts/ConnectConfig.js'
import { ThemeContextProvider } from '../../contexts/Theme.js'
import { WalletConfigContextProvider } from '../../contexts/WalletConfig.js'
import { useEmailConflict } from '../../hooks/useWaasEmailConflict.js'
import { type ConnectConfig, type DisplayedAsset, type ExtendedConnector, type ModalPosition } from '../../types.js'
import { Connect } from '../Connect/Connect.js'

export type SequenceConnectProviderProps = {
  children: ReactNode
  config: ConnectConfig
}

/**
 * @internal
 * Preview version of SequenceConnectProvider component.
 * This component should only be used for testing purposes.
 * It provides the same functionality as SequenceConnectProvider but only for preview purposes.
 */
export const SequenceConnectPreviewProvider = (props: SequenceConnectProviderProps) => {
  const { config, children } = props

  const {
    defaultTheme = 'dark',
    position = 'center',
    displayedAssets: displayedAssetsSetting = [],
    readOnlyNetworks,
    hideExternalConnectOptions = false,
    hideConnectedWallets = false,
    hideSocialConnectOptions = false
  } = config

  const [theme, setTheme] = useState<Exclude<Theme, undefined>>(defaultTheme || 'dark')
  const [modalPosition, setModalPosition] = useState<ModalPosition>(position)
  const [displayedAssets, setDisplayedAssets] = useState<DisplayedAsset[]>(displayedAssetsSetting)

  const wagmiConfig = useConfig()

  const googleWaasConnector = wagmiConfig.connectors.find(
    c => c.id === 'sequence-waas' && (c as ExtendedConnector)._wallet.id === 'google-waas'
  ) as ExtendedConnector | undefined
  const googleClientId: string = (googleWaasConnector as any)?.params?.googleClientId || ''

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
        <AnalyticsContextProvider value={{ setAnalytics: () => {}, analytics: undefined }}>
          <GoogleOAuthProvider clientId={googleClientId}>
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
              <div id="kit-provider">
                <ThemeProvider root="#kit-provider" scope="kit" theme={theme}>
                  <Connect onClose={() => {}} emailConflictInfo={emailConflictInfo} isPreview {...props} />
                </ThemeProvider>
              </div>
              {children}
            </WalletConfigContextProvider>
          </GoogleOAuthProvider>
        </AnalyticsContextProvider>
      </ThemeContextProvider>
    </ConnectConfigContextProvider>
  )
}
