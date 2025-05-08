export { SequenceConnect } from './components/SequenceConnect'

// Provider
export { SequenceConnectProvider } from './components/SequenceConnectProvider'
export { SequenceConnectPreviewProvider } from './components/SequenceConnectPreviewProvider'

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
} from './types'

// Config
export { createConfig, type CreateConfigOptions } from './config/createConfig'
export {
  getDefaultConnectors,
  getDefaultUniversalConnectors,
  getDefaultWaasConnectors,
  type DefaultConnectorOptions,
  type DefaultUniversalConnectorOptions,
  type DefaultWaasConnectorOptions
} from './config/defaultConnectors'
export { getDefaultChains } from './config/defaultChains'
export { getDefaultTransports } from './config/defaultTransports'

// Constants
export {
  DEFAULT_SESSION_EXPIRATION,
  LocalStorageKey,
  NATIVE_TOKEN_ADDRESS_0X,
  QUERY_KEYS,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  WEB_SDK_VERSION
} from './constants'

// Utils
export { getConnectWallets } from './utils/getConnectWallets'
export { capitalize, compareAddress, formatAddress, formatDisplay, isEmailValid, truncateAtMiddle } from './utils/helpers'
export { createNativeTokenBalance, getNativeTokenInfoByChainId } from './utils/tokens'
export { getModalPositionCss } from './utils/styling'
export { getNetwork, getNetworkBackgroundColor, getNetworkColor } from './utils/networks'
export { publicClientToProvider, walletClientToSigner } from './utils/adapters'
export { signEthAuthProof, validateEthProof } from './utils/ethAuth'
export { sendTransactions, waitForTransactionReceipt } from './utils/transactions'

// Contexts
export { ConnectConfigContextProvider, useConnectConfigContext } from './contexts/ConnectConfig'
export { AnalyticsContextProvider, useAnalyticsContext } from './contexts/Analytics'
export { ConnectModalContextProvider, useConnectModalContext } from './contexts/ConnectModal'
export { ThemeContextProvider, useThemeContext } from './contexts/Theme'
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
export { ecosystemWallet, type EcosystemWalletOptions } from './connectors/ecosystem'
export {
  sequenceWaasWallet,
  sequenceWallet,
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
export { useListAccounts } from './hooks/useListAccounts'
export type { ConnectedWallet } from './hooks/useWallets'
export type { LinkedWallet } from '@0xsequence/api'

export { useDirectEcosystemConnect } from './hooks/useDirectEcosystemConnect'

// Components
export { NetworkBadge } from './components/NetworkBadge'
export { CollectibleTileImage } from './components/CollectibleTileImage'
export { CryptoOption } from './components/CryptoOption'
export { SelectedIndicator } from './components/SelectedIndicator'
export { ShadowRoot } from './components/ShadowRoot'

// Indexer
export { ContractVerificationStatus } from '@0xsequence/indexer'
