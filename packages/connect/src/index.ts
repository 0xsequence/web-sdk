export { SequenceConnect } from './components/SequenceConnect'

// Provider
export { SequenceConnectProvider } from './components/SequenceConnectProvider'
export { SequenceConnectPreviewProvider } from './components/SequenceConnectPreviewProvider'

// Types
export type {
  Wallet,
  WalletField,
  WalletProperties,
  WalletType,
  DisplayedAsset,
  ExtendedConnector,
  EthAuthSettings,
  ModalPosition,
  ConnectConfig,
  StorageItem
} from './types'

// Config
export { createConfig, type CreateConfigOptions } from './config/createConfig'
export {
  getDefaultConnectors,
  getDefaultWaasConnectors,
  getDefaultUniversalConnectors,
  type DefaultConnectorOptions,
  type DefaultWaasConnectorOptions,
  type DefaultUniversalConnectorOptions
} from './config/defaultConnectors'
export { getDefaultChains } from './config/defaultChains'
export { getDefaultTransports } from './config/defaultTransports'

// Constants
export {
  LocalStorageKey,
  DEFAULT_SESSION_EXPIRATION,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  NATIVE_TOKEN_ADDRESS_0X,
  QUERY_KEYS,
  WEB_SDK_VERSION
} from './constants'

// Utils
export { getConnectWallets } from './utils/getConnectWallets'
export { isEmailValid, compareAddress, formatDisplay, capitalize, truncateAtMiddle, formatAddress } from './utils/helpers'
export { getNativeTokenInfoByChainId, createNativeTokenBalance } from './utils/tokens'
export { getModalPositionCss } from './utils/styling'
export { getNetwork, getNetworkColor, getNetworkBackgroundColor } from './utils/networks'
export { walletClientToSigner, publicClientToProvider } from './utils/adapters'
export { signEthAuthProof, validateEthProof } from './utils/ethAuth'
export { sendTransactions, waitForTransactionReceipt } from './utils/transactions'

// Contexts
export { useConnectConfigContext, ConnectConfigContextProvider } from './contexts/ConnectConfig'
export { useAnalyticsContext, AnalyticsContextProvider } from './contexts/Analytics'
export { useConnectModalContext, ConnectModalContextProvider } from './contexts/ConnectModal'
export { useThemeContext, ThemeContextProvider } from './contexts/Theme'
export { useWalletConfigContext, WalletConfigContextProvider } from './contexts/WalletConfig'

// Connectors
export { apple, type AppleOptions } from './connectors/apple'
export { appleWaas, type AppleWaasOptions } from './connectors/apple/appleWaas'
export { coinbaseWallet } from './connectors/coinbaseWallet'
export { discord, type DiscordOptions } from './connectors/discord'
export { email, type EmailOptions } from './connectors/email'
export { emailWaas, type EmailWaasOptions } from './connectors/email/emailWaas'
export { facebook, type FacebookOptions } from './connectors/facebook'
export { google, type GoogleOptions } from './connectors/google'
export { googleWaas, type GoogleWaasOptions } from './connectors/google/googleWaas'
export { mock } from './connectors/mock'
export { sequence, type SequenceOptions } from './connectors/sequence'
export { twitch, type TwitchOptions } from './connectors/twitch'
export { walletConnect } from './connectors/walletConnect'
export {
  sequenceWallet,
  sequenceWaasWallet,
  type BaseSequenceConnectorOptions,
  type BaseSequenceWaasConnectorOptions
} from './connectors/wagmiConnectors'

// Hooks
export { useOpenConnectModal } from './hooks/useOpenConnectModal'
export { useTheme } from './hooks/useTheme'
export { useWalletSettings } from './hooks/useWalletSettings'
export { useWaasFeeOptions } from './hooks/useWaasFeeOptions'
export { useCheckWaasFeeOptions } from './hooks/useCheckWaasFeeOptions'
export { useWaasSignInEmail } from './hooks/useWaasSignInEmail'
export { useSignInEmail } from './hooks/useSignInEmail'
export { useProjectAccessKey } from './hooks/useProjectAccessKey'
export { useStorage, useStorageItem } from './hooks/useStorage'
export { useChain } from './hooks/useChain'
export { useWallets } from './hooks/useWallets'
export type { ConnectedWallet } from './hooks/useWallets'
export type { LinkedWallet } from '@0xsequence/api'

// Components
export { NetworkBadge } from './components/NetworkBadge'
export { CollectibleTileImage } from './components/CollectibleTileImage'
export { CryptoOption } from './components/CryptoOption'
export { SelectedIndicator } from './components/SelectedIndicator'
export { ShadowRoot } from './components/ShadowRoot'

// Indexer
export { ContractVerificationStatus } from '@0xsequence/indexer'
