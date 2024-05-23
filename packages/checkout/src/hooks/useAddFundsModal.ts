import { useAddFundsModalContext } from '../contexts/AddFundsModal'

export const useAddFundsModal = () => {
  const { triggerAddFunds, closeAddFunds, addFundsSettings } = useAddFundsModalContext()

  return { triggerAddFunds, closeAddFunds, addFundsSettings }
}
