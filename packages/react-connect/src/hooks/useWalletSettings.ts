import { useWalletConfigContext } from '../contexts/WalletConfig'

export const useWalletSettings = () => {
  const { setDisplayedAssets, displayedAssets, readOnlyNetworks } = useWalletConfigContext()

  return {
    displayedAssets,
    readOnlyNetworks,
    setDisplayedAssets
  }
}
