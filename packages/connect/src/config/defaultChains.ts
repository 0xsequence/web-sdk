import type { Chain } from 'viem'

import { chains } from '../chains/index.js'

const getAllSupportedChains = (): [Chain, ...Chain[]] => {
  const allSupportedChains = Object.values(chains) as Chain[]

  if (allSupportedChains.length === 0) {
    throw new Error('No supported Sequence chains are configured')
  }

  return allSupportedChains as [Chain, ...Chain[]]
}

// Sequence supported Chain configs
// you may filter list of chains by passing chainIdsFilter
export const getDefaultChains = (chainIdsFilter?: number[]): [Chain, ...Chain[]] => {
  if (chainIdsFilter && chainIdsFilter.length > 0) {
    const unsupportedChainIds: number[] = []
    const selectedChains = chainIdsFilter.flatMap(chainId => {
      const chain = chains[chainId]
      if (!chain) {
        unsupportedChainIds.push(chainId)
        return []
      }
      return [chain]
    })

    if (unsupportedChainIds.length > 0) {
      console.warn(`[getDefaultChains] Ignoring unsupported chain IDs from config: ${unsupportedChainIds.join(', ')}`)
    }

    if (selectedChains.length > 0) {
      return selectedChains as [Chain, ...Chain[]]
    }

    console.warn('[getDefaultChains] No supported chain IDs found in config; falling back to all supported chains')
  }

  return getAllSupportedChains()
}
