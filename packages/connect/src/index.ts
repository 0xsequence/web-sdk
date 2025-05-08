export { SequenceConnect } from './components/SequenceConnect/index.js'

// Provider
export { SequenceConnectProvider } from './components/SequenceConnectProvider/index.js'
export { SequenceConnectPreviewProvider } from './components/SequenceConnectPreviewProvider/index.js'

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

// Config
export { createConfig, type CreateConfigOptions } from './config/createConfig.js'
export {
  getDefaultConnectors,
  getDefaultUniversalConnectors,
  getDefaultWaasConnectors,
  type DefaultConnectorOptions,
  type DefaultUniversalConnectorOptions,
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

// Utils
export { getConnectWallets } from './utils/getConnectWallets.js'
export { capitalize, compareAddress, formatAddress, formatDisplay, isEmailValid, truncateAtMiddle } from './utils/helpers.js'
export { createNativeTokenBalance, getNativeTokenInfoByChainId } from './utils/tokens.js'
export { getModalPositionCss } from './utils/styling.js'
export { getNetwork, getNetworkBackgroundColor, getNetworkColor } from './utils/networks.js'
export { publicClientToProvider, walletClientToSigner } from './utils/adapters.js'
export { signEthAuthProof, validateEthProof } from './utils/ethAuth.js'
export { sendTransactions, waitForTransactionReceipt } from './utils/transactions.js'

// Contexts
export { ConnectConfigContextProvider, useConnectConfigContext } from './contexts/ConnectConfig.js'
export { AnalyticsContextProvider, useAnalyticsContext } from './contexts/Analytics.js'
export { ConnectModalContextProvider, useConnectModalContext } from './contexts/ConnectModal.js'
export { ThemeContextProvider, useThemeContext } from './contexts/Theme.js'
export { useWalletConfigContext, WalletConfigContextProvider } from './contexts/WalletConfig.js'

// Connectors
export { apple, type AppleOptions } from './connectors/apple/apple.js'
export { appleWaas, type AppleWaasOptions } from './connectors/apple/appleWaas.js'
export { coinbaseWallet } from './connectors/coinbaseWallet/coinbaseWallet.js'
export { discord, type DiscordOptions } from './connectors/discord/discord.js'
export { email, type EmailOptions } from './connectors/email/email.js'
export { emailWaas, type EmailWaasOptions } from './connectors/email/emailWaas.js'
export { facebook, type FacebookOptions } from './connectors/facebook/facebook.js'
export { google, type GoogleOptions } from './connectors/google/google.js'
export { googleWaas, type GoogleWaasOptions } from './connectors/google/googleWaas.js'
export { mock } from './connectors/mock/mock.js'
export { sequence, type SequenceOptions } from './connectors/sequence/sequence.js'
export { twitch, type TwitchOptions } from './connectors/twitch/twitch.js'
export { walletConnect } from './connectors/walletConnect/walletConnect.js'
export { ecosystemWallet, type EcosystemWalletOptions } from './connectors/ecosystem/index.js'
export {
  sequenceWaasWallet,
  sequenceWallet,
  type BaseSequenceConnectorOptions,
  type BaseSequenceWaasConnectorOptions
} from './connectors/wagmiConnectors/index.js'

// Hooks
export { useOpenConnectModal } from './hooks/useOpenConnectModal.js'
export { useTheme } from './hooks/useTheme.js'
export { useWalletSettings } from './hooks/useWalletSettings.js'
export { useWaasFeeOptions } from './hooks/useWaasFeeOptions.js'
export { useCheckWaasFeeOptions } from './hooks/useCheckWaasFeeOptions.js'
export { useWaasSignInEmail } from './hooks/useWaasSignInEmail.js'
export { useSignInEmail } from './hooks/useSignInEmail.js'
export { useProjectAccessKey } from './hooks/useProjectAccessKey.js'
export { useStorage, useStorageItem } from './hooks/useStorage.js'
export { useChain } from './hooks/useChain.js'
export { useWallets } from './hooks/useWallets.js'
export { useListAccounts } from './hooks/useListAccounts.js'
export type { ConnectedWallet } from './hooks/useWallets.js'
export type { LinkedWallet } from '@0xsequence/api'

export { useDirectEcosystemConnect } from './hooks/useDirectEcosystemConnect.js'

// Components
export { NetworkBadge } from './components/NetworkBadge/index.js'
export { CollectibleTileImage } from './components/CollectibleTileImage/index.js'
export { CryptoOption } from './components/CryptoOption.js'
export { SelectedIndicator } from './components/SelectedIndicator.js'
export { ShadowRoot } from './components/ShadowRoot/index.js'

// Indexer
export { ContractVerificationStatus } from '@0xsequence/indexer'
