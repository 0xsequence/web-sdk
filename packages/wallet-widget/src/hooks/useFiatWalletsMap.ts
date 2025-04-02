import { useFiatWalletsMapContext } from '../contexts/FiatWalletsMap'

export const useFiatWalletsMap = () => {
  const { fiatWalletsMap, setFiatWalletsMap } = useFiatWalletsMapContext()

  return { fiatWalletsMap, setFiatWalletsMap }
}
