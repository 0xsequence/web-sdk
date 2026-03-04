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

const GOERLI_CHAIN_ID = 5
const POLYGON_MUMBAI_CHAIN_ID = 80001

export const getNetworkColor = (chainId: number, mode: 'dark' | 'light' = 'light') => {
  switch (chainId) {
    case ChainId.MAINNET:
      return mode === 'light' ? '#abf' : '#abf'
    case ChainId.POLYGON:
      return mode === 'light' ? '#c7a6ff' : '#c7a6ff'
    case ChainId.ARBITRUM:
      return mode === 'light' ? '#52A7E6' : '#52A7E6'
    case ChainId.OPTIMISM:
      return mode === 'light' ? '#DB3132' : '#DB3132'
    case ChainId.BSC:
      return mode === 'light' ? '#CB9C1D' : '#EEB445'
    case ChainId.AVALANCHE:
      return mode === 'light' ? '#E84142' : '#E84142'
    case ChainId.GNOSIS:
      return mode === 'light' ? '#00193C' : '#D8E8FF'
    case GOERLI_CHAIN_ID:
      return mode === 'light' ? '#A77A00' : '#FFA700'
    case POLYGON_MUMBAI_CHAIN_ID:
    case ChainId.POLYGON_AMOY:
      return mode === 'light' ? '#D68828' : '#FFA700'
    default:
      return mode === 'light' ? '#abf' : '#abf'
  }
}

export const getNetworkBackgroundColor = (chainId: number, mode: 'dark' | 'light' = 'light') => {
  switch (chainId) {
    case ChainId.MAINNET:
      return mode === 'light' ? '#132362' : '#132362'
    case ChainId.POLYGON:
      return mode === 'light' ? '#350881' : '#350881'
    case ChainId.ARBITRUM:
      return mode === 'light' ? '#EDF7FF' : '#0C3754'
    case ChainId.OPTIMISM:
      return mode === 'light' ? '#FFEAE9' : '#390B0C'
    case ChainId.BSC:
      return mode === 'light' ? '#FFE8AB' : '#554018'
    case ChainId.AVALANCHE:
      return mode === 'light' ? '#FBDFDF' : '#390B0C'
    case ChainId.GNOSIS:
      return mode === 'light' ? '#D8E8FF' : '#00193C'
    case GOERLI_CHAIN_ID:
      return mode === 'light' ? '#FFD871' : '#554018'
    case POLYGON_MUMBAI_CHAIN_ID:
    case ChainId.POLYGON_AMOY:
      return mode === 'light' ? '#FFE8CD' : '#554018'
    default:
      return mode === 'light' ? '#132362' : '#132362'
  }
}

export const getNetwork = (chainId: number) => {
  const network = networks[chainId as ChainId]

  if (!network) {
    throw new Error(`Unknown network chainId: ${chainId}`)
  }

  return network
}
