import { useSelectPaymentContext } from '../contexts/SelectPaymentModal'

export const useSelectPaymentModal = () => {
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentContext()

  return { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings }
}
