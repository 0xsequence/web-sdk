import { Chain } from 'viem'

import { chains } from '../chains'

// Sequence supported Chain configs
// you may filter list of chains by passing chainIdsFilter
export const getDefaultChains = (chainIdsFilter?: number[]): [Chain, ...Chain[]] => {
  if (chainIdsFilter) {
    return chainIdsFilter.map(chainId => {
      const chain = chains[chainId]

      if (!chain) {
        throw new Error(`Chain with id ${chainId} not supported by Sequence`)
      }

      return chain
    }) as [Chain, ...Chain[]]
  }

  return Object.values(chains) as [Chain, ...Chain[]]
}
