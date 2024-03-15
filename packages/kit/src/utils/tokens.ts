import { Chain } from 'wagmi/chains'

export interface NativeTokenInfo {
  name: string
  symbol: string
  logoURI: string
  decimals: number
  blockExplorerUrl: string
  blockExplorerName: string
}

interface TokenInfos {
  [key: number]: NativeTokenInfo
}

export const nativeTokenInfos: TokenInfos = {
  1: {
    name: 'Ethereum',
    symbol: 'ETH',
    logoURI: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
    decimals: 18,
    blockExplorerName: 'Etherscan',
    blockExplorerUrl: 'https://etherscan.io'
  },
  5: {
    name: 'Goerli',
    symbol: 'ETH',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
    blockExplorerName: 'Etherscan (Goerli)',
    blockExplorerUrl: 'https://goerli.etherscan.io'
  },
  10: {
    name: 'Optimism',
    symbol: 'OP',
    logoURI: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
    decimals: 18,
    blockExplorerName: 'Etherscan (Optimism)',
    blockExplorerUrl: 'https://optimistic.etherscan.io'
  },
  56: {
    name: 'BNB',
    symbol: 'BNB',
    logoURI: 'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png',
    decimals: 18,
    blockExplorerName: 'BscScan',
    blockExplorerUrl: 'https://bscscan.com'
  },
  100: {
    name: 'Gnosis',
    symbol: 'GNO',
    logoURI: 'https://assets.coingecko.com/coins/images/662/small/logo_square_simple_300px.png',
    decimals: 18,
    blockExplorerUrl: 'https://gnosisscan.io',
    blockExplorerName: 'Gnosis Scan'
  },
  137: {
    name: 'Polygon',
    symbol: 'MATIC',
    logoURI: 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png',
    decimals: 18,
    blockExplorerName: 'Polyscan',
    blockExplorerUrl: 'https://polygonscan.com'
  },
  1101: {
    name: 'Polygon zkEVM',
    symbol: 'ETH',
    logoURI: 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png',
    decimals: 18,
    blockExplorerName: 'PolygonScan',
    blockExplorerUrl: 'https://zkevm.polygonscan.com'
  },
  42161: {
    name: 'Arbitrum',
    symbol: 'ARB',
    logoURI: 'https://assets.coingecko.com/asset_platforms/images/33/small/arbitrum-one.png',
    decimals: 18,
    blockExplorerName: 'Arbiscan',
    blockExplorerUrl: 'https://arbiscan.io'
  },
  43114: {
    name: 'Avalanche',
    symbol: 'AVAX',
    logoURI: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
    decimals: 18,
    blockExplorerName: 'Snowtrace',
    blockExplorerUrl: 'https://snowtrace.io'
  },
  80001: {
    name: 'Mumbai',
    symbol: 'MATIC',
    logoURI: 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png',
    decimals: 18,
    blockExplorerName: 'Polyscan (Mumbai)',
    blockExplorerUrl: 'https://mumbai.polygonscan.com'
  }
}

export const getChainIdList = () => {
  return Object.keys(nativeTokenInfos).map(chainId => parseInt(chainId))
}

export const defaultNativeTokenInfo = (chainId: number, wagmiChains: readonly [Chain, ...Chain[]]) => {
  const foundChain = wagmiChains.find(chain => chain.id === chainId)

  if (foundChain) {
    return {
      name: foundChain.nativeCurrency.name,
      symbol: foundChain.nativeCurrency.symbol,
      decimals: foundChain.nativeCurrency.decimals,
      logoURI: nativeTokenInfos[1].logoURI,
      blockExplorerName: foundChain.blockExplorers?.default.name,
      blockExplorerUrl: foundChain.blockExplorers?.default.url
    }
  }

  return
}

export const getNativeTokenInfoByChainId = (chainId: number, wagmiChains: readonly [Chain, ...Chain[]]) => {
  return nativeTokenInfos[chainId] || defaultNativeTokenInfo(chainId, wagmiChains) || nativeTokenInfos[1]
}
