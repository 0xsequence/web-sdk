import { useSwapContext } from '../contexts/Swap.js'

export const useSwap = () => {
  const { lifiChains, lifiTokens } = useSwapContext()

  return {
    lifiChains,
    lifiTokens
  }
}
