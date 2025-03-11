import { networks, ChainId } from '@0xsequence/network'

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
    case ChainId.GOERLI:
      return mode === 'light' ? '#A77A00' : '#FFA700'
    case ChainId.POLYGON_MUMBAI:
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
    case ChainId.GOERLI:
      return mode === 'light' ? '#FFD871' : '#554018'
    case ChainId.POLYGON_MUMBAI:
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
