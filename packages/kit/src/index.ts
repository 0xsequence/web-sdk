// Provider
export { KitProvider } from './components/KitProvider'

// Types
export type {
  Wallet,
  WalletField,
  WalletProperties,
  DisplayedAsset,
  ExtendedConnector,
  EthAuthSettings,
  Theme,
  ModalPosition,
  KitConfig,
  StorageItem
} from './types'

// Constants
export { LocalStorageKey, defaultSignInOptions, DEFAULT_SESSION_EXPIRATION } from './constants'

// Utils
export { getKitConnectWallets } from './utils/getKitConnectWallets'
export { isEmailValid, compareAddress, formatDisplay, capitalize } from './utils/helpers'
export { defaultNativeTokenInfo, getNativeTokenInfoByChainId, getChainIdList } from './utils/tokens'
export { getModalPositionCss } from './utils/styling'
export { getNetwork, getNetworkColor, getNetworkBackgroundColor } from './utils/networks'
export { walletClientToSigner, publicClientToProvider } from './utils/adapters'
export { signEthAuthProof, validateEthProof } from './utils/ethAuth'

// Contexts
export { useKitConfig, KitConfigContextProvider } from './contexts/KitConfig'
export { useAnalyticsContext, AnalyticsContextProvider } from './contexts/Analytics'
export { useConnectModalContext, ConnectModalContextProvider } from './contexts/ConnectModal'
export { useThemeContext, ThemeContextProvider } from './contexts/Theme'
export { useWalletConfigContext, WalletConfigContextProvider } from './contexts/WalletSettings'

// Hooks
export { useOpenConnectModal } from './hooks/useOpenConnectModal'
export { useTheme } from './hooks/useTheme'
export { useWalletSettings } from './hooks/useWalletSettings'
export { useWaasFeeOptions } from './hooks/useWaasFeeOptions'
export { useProjectAccessKey } from './hooks/useProjectAccessKey'
export { useAPIClient } from './hooks/useAPIClient'
export { useMetadataClient } from './hooks/useMetadataClient'
export { useIndexerClient, useIndexerClients } from './hooks/useIndexerClient'
export { useStorage, useStorageItem } from './hooks/useStorage'
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
  useTransactionHistory
} from './hooks/data'
