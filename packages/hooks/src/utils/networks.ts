import { Network } from '@0xsequence/wallet-primitives'

export const ChainId = Network.ChainId
export type ChainId = number

interface BlockExplorerConfig {
  name?: string
  rootUrl: string
}

interface NativeToken {
  symbol: string
  name: string
  decimals: number
}

export interface SequenceNetwork {
  chainId: ChainId
  name: string
  title?: string
  rpcUrl: string
  logoURI?: string
  blockExplorer?: BlockExplorerConfig
  nativeToken: NativeToken
  testnet?: boolean
  deprecated?: true
}

const toSequenceNetwork = (network: Network.Network): SequenceNetwork => ({
  chainId: network.chainId,
  name: network.name,
  title: network.title,
  rpcUrl: network.rpcUrl,
  logoURI: network.logoUrl,
  blockExplorer: network.blockExplorer
    ? {
        name: network.blockExplorer.name,
        rootUrl: network.blockExplorer.url
      }
    : undefined,
  nativeToken: {
    symbol: network.nativeCurrency.symbol,
    name: network.nativeCurrency.name,
    decimals: network.nativeCurrency.decimals
  },
  testnet: network.type === Network.NetworkType.TESTNET || undefined,
  deprecated: network.deprecated
})

export const allNetworks: SequenceNetwork[] = Network.ALL.map(toSequenceNetwork)

export const networks: Record<number, SequenceNetwork> = Object.fromEntries(
  allNetworks.map(network => [network.chainId, network])
)

const toChainIdNumber = (chainIdLike: unknown): number | undefined => {
  if (typeof chainIdLike === 'number') {
    return Number.isFinite(chainIdLike) ? chainIdLike : undefined
  }
  if (typeof chainIdLike === 'bigint') {
    return Number(chainIdLike)
  }
  if (typeof chainIdLike === 'string') {
    const maybeNumber = Number(chainIdLike)
    return Number.isFinite(maybeNumber) ? maybeNumber : undefined
  }
  if (chainIdLike && typeof chainIdLike === 'object' && 'chainId' in chainIdLike) {
    return toChainIdNumber((chainIdLike as { chainId: unknown }).chainId)
  }
  return undefined
}

export const findSupportedNetwork = (
  chainIdOrName: string | number | bigint | { chainId: unknown }
): SequenceNetwork | undefined => {
  const chainId = toChainIdNumber(chainIdOrName)
  if (chainId !== undefined) {
    return networks[chainId]
  }

  if (typeof chainIdOrName === 'string') {
    const networkName = chainIdOrName.toLowerCase()
    return allNetworks.find(network => network.name === networkName)
  }

  return undefined
}
