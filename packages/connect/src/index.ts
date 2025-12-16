export { SequenceConnect } from './components/SequenceConnect/index.js'
export { SequenceConnectInline } from './components/SequenceConnectInline/index.js'

// Provider
export { SequenceConnectProvider } from './components/SequenceConnectProvider/index.js'
export { EpicAuthProvider } from './components/EpicAuthProvider/index.js'

export { SequenceConnectInlineProvider } from './components/SequenceConnectInlineProvider/index.js'
// Preview
export { SequenceConnectPreview, SequenceConnectPreviewProvider } from './components/SequenceConnectPreview/index.js'

// Types
export type {
  ConnectConfig,
  DisplayedAsset,
  EthAuthSettings,
  ExtendedConnector,
  LogoProps,
  ModalPosition,
  StorageItem,
  Wallet,
  WalletField,
  WalletProperties,
  WalletType
} from './types.js'
export * from './utils/session/types.js'
export type { ExplicitSession, Session } from '@0xsequence/dapp-client'

// Config
export { createConfig, type CreateConfigOptions, type SequenceConnectConfig } from './config/createConfig.js'
export {
  getDefaultConnectors,
  getDefaultV3Connectors,
  getDefaultWaasConnectors,
  type DefaultConnectorOptions,
  type DefaultV3ConnectorOptions,
  type DefaultWaasConnectorOptions
} from './config/defaultConnectors.js'
export { getDefaultChains } from './config/defaultChains.js'
export { getDefaultTransports } from './config/defaultTransports.js'

// Constants
export {
  DEFAULT_SESSION_EXPIRATION,
  LocalStorageKey,
  NATIVE_TOKEN_ADDRESS_0X,
  QUERY_KEYS,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  WEB_SDK_VERSION
} from './constants/index.js'
export * from './utils/session/constants.js'

// Utils
export { getConnectWallets } from './utils/getConnectWallets.js'
export {
  capitalize,
  compareAddress,
  formatAddress,
  formatDisplay,
  isEmailValid,
  truncateAtIndex,
  truncateAtMiddle
} from './utils/helpers.js'
export { createNativeTokenBalance, getNativeTokenInfoByChainId } from './utils/tokens.js'
export { getModalPositionCss } from './utils/styling.js'
export { getNetwork, getNetworkBackgroundColor, getNetworkColor } from './utils/networks.js'
export { signEthAuthProof, validateEthProof } from './utils/ethAuth.js'
export { isTxRejected, sendTransactions, waitForTransactionReceipt } from './utils/transactions.js'
export { createContractPermission, createContractPermissions, createExplicitSessionConfig } from './utils/session/index.js'

// Contexts
export {
  ConnectConfigContextProvider,
  useConnectConfigContext,
  useOptionalConnectConfigContext
} from './contexts/ConnectConfig.js'
export { AnalyticsContextProvider, useAnalyticsContext } from './contexts/Analytics.js'
export { ConnectModalContextProvider, useConnectModalContext } from './contexts/ConnectModal.js'
export { ThemeContextProvider, useThemeContext } from './contexts/Theme.js'
export { useWalletConfigContext, WalletConfigContextProvider } from './contexts/WalletConfig.js'

// Connectors
export { appleWaas, type AppleWaasOptions } from './connectors/apple/appleWaas.js'
export { coinbaseWallet } from './connectors/coinbaseWallet/coinbaseWallet.js'
export { emailWaas, type EmailWaasOptions } from './connectors/email/emailWaas.js'
export { epicWaas, type EpicWaasOptions } from './connectors/epic/epicWaas.js'
export { googleWaas, type GoogleWaasOptions } from './connectors/google/googleWaas.js'
export { guestWaas, type GuestWaasOptions } from './connectors/guest/guestWaas.js'
export { mock } from './connectors/mock/mock.js'
export { XWaas, type XWaasOptions } from './connectors/X/XWaas.js'
export { walletConnect } from './connectors/walletConnect/walletConnect.js'
export { metaMask } from './connectors/metaMask/metaMask.js'

export {
  sequenceV3Wallet,
  sequenceWaasWallet,
  type BaseSequenceV3ConnectorOptions,
  type BaseSequenceWaasConnectorOptions
} from './connectors/wagmiConnectors/index.js'

// Hooks
export { useOpenConnectModal } from './hooks/useOpenConnectModal.js'
export { useTheme } from './hooks/useTheme.js'
export { useWalletSettings } from './hooks/useWalletSettings.js'

export { useSignInEmail } from './hooks/useSignInEmail.js'
export { useProjectAccessKey } from './hooks/useProjectAccessKey.js'
export { useStorage, useStorageItem } from './hooks/useStorage.js'
export { useChain } from './hooks/useChain.js'
export { useWallets } from './hooks/useWallets.js'
export { useListAccounts } from './hooks/useListAccounts.js'
export type { ConnectedWallet } from './hooks/useWallets.js'
export type { LinkedWallet } from '@0xsequence/api'
export { useSocialLink } from './hooks/useSocialLink.js'
export { useCheckWaasFeeOptions } from './hooks/useCheckWaasFeeOptions.js'
export { useWaasFeeOptions } from './hooks/useWaasFeeOptions.js'
export { useWaasConfirmationHandler } from './hooks/useWaasConfirmationHandler.js'
export { useEmailAuth as useWaasEmailAuth } from './hooks/useWaasEmailAuth.js'
export { useEmailConflict as useWaasEmailConflict } from './hooks/useWaasEmailConflict.js'
export { useWaasSignInEmail } from './hooks/useWaasSignInEmail.js'

export { useFeeOptions } from './hooks/useFeeOptions.js'
export { useExplicitSessions } from './hooks/useExplicitSessions.js'
export { useSequenceSessionState } from './hooks/useSequenceSessionState.js'
export { useAuthStatus } from './hooks/useAuthStatus.js'
export type { UseAuthStatusOptions, UseAuthStatusResult } from './hooks/useAuthStatus.js'

// Components
export { NetworkBadge } from './components/NetworkBadge/index.js'
export { CollectibleTileImage } from './components/CollectibleTileImage/index.js'
export { CryptoOption } from './components/CryptoOption.js'
export { SelectedIndicator } from './components/SelectedIndicator.js'
export { ShadowRoot } from './components/ShadowRoot/index.js'
export { EmailWaasVerify } from './components/Connect/EmailWaasVerify.js'

// Indexer
export { ContractVerificationStatus } from '@0xsequence/indexer'
