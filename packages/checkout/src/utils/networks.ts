import { NetworkMetadata } from '@0xsequence/network'

import { capitalize } from './helpers'

export const getPaperNetworkName = (network: NetworkMetadata): string => {
  if (network.chainId === 1) {
    return 'Ethereum'
  }
  return capitalize(network.name)
}
