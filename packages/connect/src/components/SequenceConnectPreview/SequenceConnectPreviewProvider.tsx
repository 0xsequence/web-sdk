'use client'

import { Spinner, ThemeProvider, type Theme } from '@0xsequence/design-system'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useState, type ReactNode } from 'react'
import { useConfig } from 'wagmi'

import { AnalyticsContextProvider } from '../../contexts/Analytics.js'
import { ConnectConfigContextProvider } from '../../contexts/ConnectConfig.js'
import { ThemeContextProvider } from '../../contexts/Theme.js'
import { WalletConfigContextProvider } from '../../contexts/WalletConfig.js'
import { useResolvedConnectConfig } from '../../hooks/useResolvedConnectConfig.js'
import { useSyncWagmiChains } from '../../hooks/useSyncWagmiChains.js'
import { useEmailConflict } from '../../hooks/useWaasEmailConflict.js'
import { type ConnectConfig, type DisplayedAsset, type ExtendedConnector, type ModalPosition } from '../../types.js'
import { Connect } from '../Connect/Connect.js'

export type SequenceConnectProviderProps = {
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
 * @internal
 * Preview version of SequenceConnectProvider component.
 * This component should only be used for testing purposes.
 * It provides the same functionality as SequenceConnectProvider but only for preview purposes.
 */
export const SequenceConnectPreviewProvider = (props: SequenceConnectProviderProps) => {
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
  useSyncWagmiChains(config, wagmiConfig)

  const inlineBackground = resolveInlineBackground(theme)

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
              <div id="kit-provider" style={{ background: inlineBackground }}>
                <ThemeProvider root="#kit-provider" scope="kit" theme={theme}>
                  {isWalletConfigLoading ? (
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
              {children}
            </WalletConfigContextProvider>
          </GoogleOAuthProvider>
        </AnalyticsContextProvider>
      </ThemeContextProvider>
    </ConnectConfigContextProvider>
  )
}
