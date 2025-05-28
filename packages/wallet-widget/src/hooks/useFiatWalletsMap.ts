import { useFiatWalletsMapContext } from '../contexts/FiatWalletsMap.js'

export const useFiatWalletsMap = () => {
  const { fiatWalletsMap, totalFiatValue } = useFiatWalletsMapContext()

  return { fiatWalletsMap, totalFiatValue }
}
