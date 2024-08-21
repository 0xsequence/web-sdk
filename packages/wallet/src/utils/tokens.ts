import { TokenPrice } from '@0xsequence/api'
import { vars } from '@0xsequence/design-system'
import { TokenBalance, GetTransactionHistoryReturn, Transaction } from '@0xsequence/indexer'
import { InfiniteData } from '@tanstack/react-query'
import { ethers } from 'ethers'

import { compareAddress } from './helpers'

export const getPercentageColor = (value: number) => {
  if (value > 0) {
    return vars.colors.positive
  } else if (value < 0) {
    return vars.colors.negative
  } else {
    return vars.colors.text50
  }
}

export const getPercentagePriceChange = (balance: TokenBalance, prices: TokenPrice[]) => {
  const priceForToken = prices.find(p => compareAddress(p.token.contractAddress, balance.contractAddress))
  if (!priceForToken) {
    return 0
  }

  const price24HourChange = priceForToken?.price24hChange?.value || 0
  return price24HourChange
}

interface ComputeBalanceFiat {
  balance: TokenBalance
  prices: TokenPrice[]
  decimals: number
  conversionRate: number
}

export const computeBalanceFiat = ({ balance, prices, decimals, conversionRate }: ComputeBalanceFiat): string => {
  let totalUsd = 0

  const priceForToken = prices.find(p => compareAddress(p.token.contractAddress, balance.contractAddress))
  if (!priceForToken) {
    return '0.00'
  }
  const priceFiat = priceForToken.price?.value || 0
  const valueFormatted = ethers.formatUnits(balance.balance, decimals)
  const usdValue = parseFloat(valueFormatted) * priceFiat
  totalUsd += usdValue

  const fiatValue = totalUsd * conversionRate

  return `${fiatValue.toFixed(2)}`
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
    if (balance.contractAddress === ethers.ZeroAddress) {
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

export const flattenPaginatedTransactionHistory = (
  transactionHistoryData: InfiniteData<GetTransactionHistoryReturn> | undefined
) => {
  const transactionHistory: Transaction[] = []

  transactionHistoryData?.pages.forEach(page => {
    transactionHistory.push(...page.transactions)
  })

  return transactionHistory
}
