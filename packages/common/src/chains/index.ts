import { allNetworks } from '@0xsequence/network'
import { defineChain } from 'viem'
import type { Chain } from 'viem/chains'

// Sequence supported Chain configs
export const chains = allNetworks.reduce<Record<number, Chain>>((acc, network) => {
  // Filter out deprecated networks
  if (network.deprecated) {
    return acc
  }

  // Filter out hardhat networks
  if (network.name.startsWith('hardhat')) {
    return acc
  }

  acc[network.chainId] = defineChain({
    id: network.chainId,
    name: network.title!,
    shortName: network.name,
    nativeCurrency: {
      name: network.nativeToken.name,
      symbol: network.nativeToken.symbol,
      decimals: network.nativeToken.decimals
    },
    rpcUrls: {
      default: {
        http: [network.rpcUrl]
      }
    },
    ...(network.blockExplorer
      ? {
          blockExplorers: {
            default: {
              name: network.blockExplorer.name!,
              url: network.blockExplorer.rootUrl!
            }
          }
        }
      : undefined)
  })

  return acc
}, {})
