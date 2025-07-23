// Constants
export { TRANSACTION_CONFIRMATIONS_DEFAULT } from './constants/transactions.js'
export { chains } from './chains/index.js'

// Utils
export {
  capitalize,
  compareAddress,
  formatAddress,
  formatDisplay,
  isEmailValid,
  isJSON,
  normalizeChainId,
  truncateAtIndex,
  truncateAtMiddle
} from './utils/helpers.js'

export { createNativeTokenBalance, getNativeTokenInfoByChainId } from './utils/tokens.js'
export { getNetwork, getNetworkBackgroundColor, getNetworkColor } from './utils/networks.js'
export { getModalPositionCss } from './utils/styling.js'
export { publicClientToProvider, walletClientToSigner } from './utils/adapters.js'
export { sendTransactions, waitForTransactionReceipt } from './utils/transactions.js'

// Types
export type {
  ExtendedConnector,
  LogoProps,
  ModalPosition,
  Wallet,
  WalletField,
  WalletProperties,
  WalletType
} from './types/index.js'

// Components
export { NetworkBadge } from './components/NetworkBadge/index.js'
export { CollectibleTileImage } from './components/CollectibleTileImage/index.js'
export { CryptoOption } from './components/CryptoOption.js'
export { SelectedIndicator } from './components/SelectedIndicator.js'

// Indexer
export { ContractVerificationStatus } from '@0xsequence/indexer'
