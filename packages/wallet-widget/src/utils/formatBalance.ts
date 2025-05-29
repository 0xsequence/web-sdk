import { formatDisplay } from '@0xsequence/connect'
import { getNativeTokenInfoByChainId } from '@0xsequence/connect'
import { compareAddress } from '@0xsequence/design-system'
import type { TokenBalance } from '@0xsequence/indexer'
import { formatUnits, type Chain } from 'viem'
import { zeroAddress } from 'viem'

import type { TokenBalanceWithDetails } from './tokens.js'

//TODO: rename these and maybe do a refactor

interface NativeTokenInfo {
  chainId: number
  name: string
  symbol: string
  logoURI: string
  decimals: number
  blockExplorerUrl?: string
  blockExplorerName?: string
}

interface TokenInfo {
  name: string
  logo?: string
  symbol?: string
  isNativeToken: boolean
  nativeTokenInfo?: NativeTokenInfo
  displayBalance: string
  fiatBalance: string
}

export const formatTokenInfo = (
  balance: TokenBalanceWithDetails | undefined,
  fiatSign: string,
  chains: readonly [Chain, ...Chain[]]
): TokenInfo => {
  if (!balance) {
    return { isNativeToken: false, logo: '', name: '', symbol: '', displayBalance: '', fiatBalance: '' }
  }

  const isNativeToken = compareAddress(balance?.contractAddress || '', zeroAddress)
  const nativeTokenInfo = getNativeTokenInfoByChainId(balance?.chainId || 1, chains)

  const selectedCoinLogo = isNativeToken ? nativeTokenInfo.logoURI : balance?.contractInfo?.logoURI
  const selectedCoinName = isNativeToken ? nativeTokenInfo.name : balance?.contractInfo?.name || 'Unknown'
  const selectedCoinSymbol = isNativeToken ? nativeTokenInfo.symbol : balance?.contractInfo?.symbol

  const decimals = isNativeToken ? nativeTokenInfo.decimals : balance?.contractInfo?.decimals
  const bal = formatUnits(BigInt(balance?.balance || 0), decimals || 18)
  const displayBalance = formatDisplay(bal)
  const symbol = isNativeToken ? nativeTokenInfo.symbol : balance?.contractInfo?.symbol
  const fiatBalance = (balance?.price?.value || 0) * Number(bal)

  return {
    isNativeToken,
    nativeTokenInfo,
    logo: selectedCoinLogo,
    name: selectedCoinName,
    symbol: selectedCoinSymbol,
    displayBalance: `${displayBalance} ${symbol}`,
    fiatBalance: `${fiatSign}${fiatBalance.toFixed(2)}`
  }
}

export const formatFiatBalance = (balance: number, price: number, decimals: number, fiatSign: string) => {
  if (!balance) {
    return ''
  }

  const bal = formatUnits(BigInt(Number(balance)), decimals || 18)

  return `${fiatSign}${(price * Number(bal)).toFixed(2)}`
}

export const formatTokenUnits = (token: TokenBalance | undefined, chains: readonly [Chain, ...Chain[]]) => {
  if (!token) {
    return ''
  }

  const isNativeToken = token.contractType === 'NATIVE'
  const nativeTokenInfo = getNativeTokenInfoByChainId(token.chainId, chains)

  if (isNativeToken) {
    return formatUnits(BigInt(Number(token.balance)), nativeTokenInfo.decimals)
  }
  return formatUnits(BigInt(Number(token.balance)), token.contractInfo?.decimals || 18)
}

export const decimalsToWei = (balance: number, decimals: number) => {
  const scaledBalance = balance * Math.pow(10, decimals)

  const balanceBigInt = BigInt(scaledBalance)

  return Number(balanceBigInt)
}
