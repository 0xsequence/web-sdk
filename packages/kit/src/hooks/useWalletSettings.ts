import { useWalletConfigContext } from '../contexts/WalletSettings'

export const useWalletSettings = () => {
  const { displayedChainIds, displayedContracts, readOnlyNetworks } = useWalletConfigContext()

  return {
    displayedChainIds,
    displayedContracts,
    readOnlyNetworks
  }
}
