import { nativeTokenImageUrl } from '@0xsequence/design-system'
import { Chain } from 'wagmi/chains'

import { chains } from '../chains'
import { zeroAddress } from 'viem'
import { ContractType, TokenBalance } from '@0xsequence/indexer'

export interface NativeTokenInfo {
  chainId: number
  name: string
  symbol: string
  logoURI: string
  decimals: number
  blockExplorerUrl?: string
  blockExplorerName?: string
}

export const getNativeTokenInfoByChainId = (chainId: number, wagmiChains: readonly [Chain, ...Chain[]]): NativeTokenInfo => {
  // Get chain data from wagmi
  const chain = wagmiChains.find(chain => chain.id === chainId) || chains[chainId]

  if (chain) {
    return {
      chainId: chain.id,
      name: chain.nativeCurrency.name,
      symbol: chain.nativeCurrency.symbol,
      decimals: chain.nativeCurrency.decimals,
      logoURI: nativeTokenImageUrl(chain.id),
      blockExplorerName: chain.blockExplorers?.default.name,
      blockExplorerUrl: chain.blockExplorers?.default.url
    }
  }

  return {
    chainId,
    name: 'Unknown',
    symbol: '???',
    decimals: 18,
    logoURI: ''
  }
}

export const createNativeTokenBalance = (chainId: number, accountAddress: string, balance: string = '0'): TokenBalance => {
  return {
    chainId,
    contractAddress: zeroAddress,
    accountAddress,
    contractType: ContractType.UNKNOWN,
    balance,
    blockHash: '',
    blockNumber: 0,
    tokenID: '',
    isSummary: false,
    uniqueCollectibles: ''
  }
}
