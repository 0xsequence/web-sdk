// Provider
export { SequenceCheckoutProvider, type SequenceCheckoutConfig } from './components/SequenceCheckoutProvider/index.js'

// Hooks
export { useCheckoutModal } from './hooks/useCheckoutModal.js'
export { useAddFundsModal } from './hooks/useAddFundsModal.js'
export { useSelectPaymentModal } from './hooks/useSelectPaymentModal.js'
export { useTransferFundsModal } from './hooks/useTransferFundsModal.js'
export { useCheckoutWhitelistStatus } from './hooks/useCheckoutWhitelistStatus.js'
export { useSwapModal } from './hooks/useSwapModal.js'
export { useERC1155SaleContractCheckout, useERC1155SaleContractPaymentModal } from './hooks/useERC1155SaleContractCheckout.js'
export { useCheckoutUI } from './hooks/useCheckoutUI/index.js'

export { type CheckoutSettings } from './contexts/CheckoutModal.js'
export { type AddFundsSettings } from './contexts/AddFundsModal.js'
export { type SelectPaymentSettings } from './contexts/SelectPaymentModal.js'
export { type SwapModalSettings } from './contexts/SwapModal.js'
export { type CreditCardProviders } from './contexts/SelectPaymentModal.js'
// utils
export { fetchTransakSupportedCountries, getTransakLink } from './utils/transak.js'

// OnRampProvider
export { TransactionOnRampProvider } from '@0xsequence/marketplace'
