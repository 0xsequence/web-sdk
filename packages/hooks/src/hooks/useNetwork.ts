import { ChainId, networks } from '../utils/networks.js'

export const useNetwork = (chainId: number) => {
  return networks[chainId as ChainId]
}
