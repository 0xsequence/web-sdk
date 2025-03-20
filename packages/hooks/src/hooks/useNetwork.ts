import { ChainId, networks } from '@0xsequence/network'

export const useNetwork = (chainId: number) => {
  return networks[chainId as ChainId]
}
