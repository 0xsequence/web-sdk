import { NetworkConfig } from '@0xsequence/network'
import { capitalize } from './helpers'

export const getPaperNetworkName = (network: NetworkConfig): string => {
  if (network.chainId === 1) {
    return 'Ethereum'
  }
  return capitalize(network.name)
}
