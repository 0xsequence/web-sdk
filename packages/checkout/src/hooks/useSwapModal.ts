import { useSwapModalContext } from '../contexts/SwapModal'

export const useSwapModal = () => {
  const { openSwapModal, closeSwapModal, swapModalSettings } = useSwapModalContext()

  return { openSwapModal, closeSwapModal, swapModalSettings }
}
