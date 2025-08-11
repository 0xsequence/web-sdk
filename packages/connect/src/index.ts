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
  WalletProperties
} from './types.js'

// Config
export { createConfig, type CreateConfigOptions } from './config/createConfig.js'
export { getDefaultConnectors, type DefaultConnectorOptions } from './config/defaultConnectors.js'
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
export { coinbaseWallet } from './connectors/coinbaseWallet/coinbaseWallet.js'

export { mock } from './connectors/mock/mock.js'

export { walletConnect } from './connectors/walletConnect/walletConnect.js'

// Hooks
export { useOpenConnectModal } from './hooks/useOpenConnectModal.js'
export { useTheme } from './hooks/useTheme.js'
export { useWalletSettings } from './hooks/useWalletSettings.js'
export { useWaasFeeOptions } from './hooks/useWaasFeeOptions.js'
export { useWaasConfirmationHandler } from './hooks/useWaasConfirmationHandler.js'
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
export { useSocialLink } from './hooks/useSocialLink.js'

export { useFeeOptions } from './hooks/useFeeOptions.js'
export { usePermissions } from './hooks/usePermissions.js'

// Components
export { NetworkBadge } from './components/NetworkBadge/index.js'
export { CollectibleTileImage } from './components/CollectibleTileImage/index.js'
export { CryptoOption } from './components/CryptoOption.js'
export { SelectedIndicator } from './components/SelectedIndicator.js'
export { ShadowRoot } from './components/ShadowRoot/index.js'

// Indexer
export { ContractVerificationStatus } from '@0xsequence/indexer'
