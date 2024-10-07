export { SequenceKit } from './components/SequenceKit'

// Provider
export { KitProvider } from './components/KitProvider'
export { KitPreviewProvider } from './components/KitPreviewProvider'

// Types
export type {
  Wallet,
  WalletField,
  WalletProperties,
  WalletType,
  DisplayedAsset,
  ExtendedConnector,
  EthAuthSettings,
  Theme,
  ModalPosition,
  KitConfig,
  StorageItem
} from './types'
export type { SwapPricesWithCurrencyInfo } from './hooks/data'

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
export { LocalStorageKey, DEFAULT_SESSION_EXPIRATION, TRANSACTION_CONFIRMATIONS_DEFAULT } from './constants'

// Utils
export { getKitConnectWallets } from './utils/getKitConnectWallets'
export { isEmailValid, compareAddress, formatDisplay, capitalize } from './utils/helpers'
export { getNativeTokenInfoByChainId } from './utils/tokens'
export { getModalPositionCss } from './utils/styling'
export { getNetwork, getNetworkColor, getNetworkBackgroundColor } from './utils/networks'
export { walletClientToSigner, publicClientToProvider } from './utils/adapters'
export { signEthAuthProof, validateEthProof } from './utils/ethAuth'
export { sendTransactions } from './utils/transactions'

// Contexts
export { useKitConfig, KitConfigContextProvider } from './contexts/KitConfig'
export { useAnalyticsContext, AnalyticsContextProvider } from './contexts/Analytics'
export { useConnectModalContext, ConnectModalContextProvider } from './contexts/ConnectModal'
export { useThemeContext, ThemeContextProvider } from './contexts/Theme'
export { useWalletConfigContext, WalletConfigContextProvider } from './contexts/WalletSettings'

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
export { useWaasSignInEmail } from './hooks/useWaasSignInEmail'
export { useProjectAccessKey } from './hooks/useProjectAccessKey'
export { useAPIClient } from './hooks/useAPIClient'
export { useMetadataClient } from './hooks/useMetadataClient'
export { useIndexerClient, useIndexerClients } from './hooks/useIndexerClient'
export { useStorage, useStorageItem } from './hooks/useStorage'
export { useChain } from './hooks/useChain'
export {
  getNativeTokenBalance,
  getCollectionBalance,
  getCoinPrices,
  getTransactionHistory,
  useBalances,
  useExchangeRate,
  getTokenBalances,
  useCoinBalance,
  useCoinPrices,
  useCollectionBalance,
  useCollectibleBalance,
  useCollectiblePrices,
  useTokenMetadata,
  useContractInfo,
  useTransactionHistory,
  useSwapPrices,
  useSwapQuote
} from './hooks/data'

// Components
export { NetworkBadge } from './components/NetworkBadge'
export { CollectibleTileImage } from './components/CollectibleTileImage'
