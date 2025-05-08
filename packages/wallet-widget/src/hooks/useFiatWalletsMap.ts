import { useFiatWalletsMapContext } from '../contexts/FiatWalletsMap.js'

export const useFiatWalletsMap = () => {
  const { fiatWalletsMap, setFiatWalletsMap } = useFiatWalletsMapContext()

  return { fiatWalletsMap, setFiatWalletsMap }
}
