import { ContractType, TokenBalance } from '@0xsequence/indexer'

import { ZERO_ADDRESS } from '../constants/hooks'

export const compareAddress = (a: string, b: string) => {
  return a.toLowerCase() === b.toLowerCase()
}

export const splitEvery = (n: number, list: any[]) => {
  if (n <= 0) {
    throw new Error('First argument to splitEvery must be a positive integer')
  }
  const result = []
  let idx = 0
  while (idx < list.length) {
    result.push(list.slice(idx, (idx += n)))
  }
  return result
}

export const createNativeTokenBalance = (chainId: number, accountAddress: string, balance: string = '0'): TokenBalance => {
  return {
    chainId,
    contractAddress: ZERO_ADDRESS,
    accountAddress,
    contractType: ContractType.NATIVE,
    balance,
    blockHash: '',
    blockNumber: 0,
    tokenID: '',
    isSummary: false,
    uniqueCollectibles: ''
  }
}

interface SortBalancesByTypeReturn {
  nativeTokens: TokenBalance[]
  erc20Tokens: TokenBalance[]
  collectibles: TokenBalance[]
}

const compareTokenBalanceIds = (a: TokenBalance, b: TokenBalance) => {
  return (a.tokenID || '').localeCompare(b.tokenID || '')
}

export const sortBalancesByType = (balances: TokenBalance[]): SortBalancesByTypeReturn => {
  const nativeTokens: TokenBalance[] = []
  const erc20Tokens: TokenBalance[] = []
  const collectibles: TokenBalance[] = []

  balances.forEach(balance => {
    // Note: contractType for the native token should be "UNKNOWN"
    if (balance.contractAddress === ZERO_ADDRESS) {
      nativeTokens.push(balance)
    } else if (balance.contractType === 'ERC20') {
      erc20Tokens.push(balance)
    } else if (balance.contractType === 'ERC721' || balance.contractType === 'ERC1155') {
      collectibles.push(balance)
    }
  })

  const sortedNativeTokens = nativeTokens.sort(compareTokenBalanceIds)
  const sortedErc20Tokens = erc20Tokens.sort(compareTokenBalanceIds)
  const sortedCollectibles = collectibles.sort(compareTokenBalanceIds)

  return {
    nativeTokens: sortedNativeTokens,
    erc20Tokens: sortedErc20Tokens,
    collectibles: sortedCollectibles
  }
}
