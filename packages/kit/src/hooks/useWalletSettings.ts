import { useWalletConfigContext } from '../contexts/WalletSettings'

export const useWalletSettings = () => {
  const { displayedAssets, setDisplayedAssets, readOnlyNetworks } = useWalletConfigContext()

  return {
    displayedAssets,
    setDisplayedAssets,
    readOnlyNetworks
  }
}
