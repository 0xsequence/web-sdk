import { allNetworks } from '@0xsequence/network'
import { defineChain } from 'viem'
import type { Chain } from 'viem/chains'

export const chains = allNetworks.reduce<Record<number, Chain>>((acc, network) => {
  acc[network.chainId] = defineChain({
    id: network.chainId,
    name: network.title!,
    shortName: network.name,
    nativeCurrency: { name: '???', symbol: '???', decimals: 18 },
    rpcUrls: {
      default: {
        http: [network.rpcUrl]
      }
    },
    // nativeCurrency: {
    //   name: network.nativeToken.name,
    //   symbol: network.nativeToken.symbol,
    //   decimals: network.nativeToken.decimals
    // },
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
