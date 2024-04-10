import { useContext } from 'react'
import { useCheckoutModalContext } from '../contexts/CheckoutModal'

export const useCheckoutModal = () => {
  const { triggerCheckout, closeCheckout, settings } = useCheckoutModalContext()

  return { triggerCheckout, closeCheckout, settings }
}
