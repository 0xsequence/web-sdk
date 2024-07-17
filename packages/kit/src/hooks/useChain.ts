import { useChainId, useChains } from 'wagmi'

// Returns chain config for current chain or chain by id
export const useChain = (chainId?: number) => {
  const chains = useChains()
  const currentChainId = useChainId()

  return chains.find(chain => (chainId ? chain.id === chainId : chain.id === currentChainId))
}
