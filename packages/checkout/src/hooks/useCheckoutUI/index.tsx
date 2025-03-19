import { Collectible } from '../../contexts/SelectPaymentModal'
import { useOrderSummary, type UseOrderSummaryArgs, type UseOrderSummaryReturn } from './useOrderSummary'

// crypto payment

// credit card payment

interface UseCheckoutUIArgs {
  chain: string | number
  currencyAddress: string
  totalPriceRaw: string
  collectibles: Collectible[]
  collectionAddress: string
  recipientAddress: string
  transactionConfirmations?: number
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  onClose?: () => void
}

interface UseCheckoutUIReturn {
  useOrderSummary: (args: UseOrderSummaryArgs) => UseOrderSummaryReturn
}

export const useCheckoutUI = ({
  chain,
  currencyAddress,
  totalPriceRaw,
  collectibles,
  collectionAddress,
  recipientAddress,
  transactionConfirmations
}: UseCheckoutUIArgs): UseCheckoutUIReturn => {
  return {
    useOrderSummary: useOrderSummary({
      chain,
      currencyAddress,
      totalPriceRaw,
      collectibles,
      collectionAddress
    })
  }
}
