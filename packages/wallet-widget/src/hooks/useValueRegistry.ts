import { useValueRegistryContext } from '../contexts/ValueRegistry.js'

export const useValueRegistry = () => {
  const { valueRegistryMap, totalValue } = useValueRegistryContext()

  return { valueRegistryMap, totalValue }
}
