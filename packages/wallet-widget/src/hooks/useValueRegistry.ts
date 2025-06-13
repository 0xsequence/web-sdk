import { useValueRegistryContext } from '../contexts/valueRegistry.js'

export const useValueRegistry = () => {
  const { valueRegistryMap, totalValue } = useValueRegistryContext()

  return { valueRegistryMap, totalValue }
}
