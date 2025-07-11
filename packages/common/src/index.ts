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
