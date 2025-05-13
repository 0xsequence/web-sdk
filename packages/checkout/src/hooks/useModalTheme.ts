import { useCheckoutModalContext } from '../contexts/CheckoutModal.js'

export const useModalTheme = () => {
  const { theme } = useCheckoutModalContext()

  return theme
}
