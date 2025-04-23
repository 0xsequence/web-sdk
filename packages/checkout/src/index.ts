// Provider
export { SequenceCheckoutProvider, type SequenceCheckoutConfig } from './components/SequenceCheckoutProvider'

// Hooks
export { useCheckoutModal } from './hooks/useCheckoutModal'
export { useAddFundsModal } from './hooks/useAddFundsModal'
export { useSelectPaymentModal } from './hooks/useSelectPaymentModal'
export { useTransferFundsModal } from './hooks/useTransferFundsModal'
export { useCheckoutWhitelistStatus } from './hooks/useCheckoutWhitelistStatus'
export { useSwapModal } from './hooks/useSwapModal'
export { useERC1155SaleContractCheckout, useERC1155SaleContractPaymentModal } from './hooks/useERC1155SaleContractCheckout'
export { useCheckoutUI } from './hooks/useCheckoutUI'

export { type CheckoutSettings } from './contexts/CheckoutModal'
export { type AddFundsSettings } from './contexts/AddFundsModal'
export { type SelectPaymentSettings } from './contexts/SelectPaymentModal'
export { type SwapModalSettings } from './contexts/SwapModal'

// utils
export { fetchTransakSupportedCountries, getTransakLink } from './utils/transak'

// OnRampProvider
export { TransactionOnRampProvider } from '@0xsequence/marketplace'
