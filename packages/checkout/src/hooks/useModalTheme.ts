import { useCheckoutModalContext } from '../contexts/CheckoutModal'

export const useModalTheme = () => {
  const { theme } = useCheckoutModalContext()

  return theme
}
