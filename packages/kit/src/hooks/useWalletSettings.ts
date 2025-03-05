import { useWalletConfigContext } from '../contexts/WalletSettings'

export const useWalletSettings = () => {
  const { setDisplayedAssets, displayedAssets, readOnlyNetworks } = useWalletConfigContext()

  return {
    displayedAssets,
    readOnlyNetworks,
    setDisplayedAssets
  }
}
