import { formatDisplay } from '@0xsequence/connect'
import { getNativeTokenInfoByChainId } from '@0xsequence/connect'
import { compareAddress } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import { Chain, formatUnits } from 'viem'
import { zeroAddress } from 'viem'

import { TokenBalanceWithPrice } from './tokens'

//TODO: rename these and maybe do a refactor

export const formatTokenInfo = (
  balance: TokenBalanceWithPrice | undefined,
  fiatSign: string,
  chains: readonly [Chain, ...Chain[]]
) => {
  if (!balance) {
    return { logo: '', name: '', symbol: '', displayBalance: '', fiatBalance: '' }
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

  return {
    isNativeToken,
    nativeTokenInfo,
    logo: selectedCoinLogo,
    name: selectedCoinName,
    symbol: selectedCoinSymbol,
    displayBalance: `${displayBalance} ${symbol}`,
    fiatBalance: `${fiatSign}${(balance.price.value * Number(bal)).toFixed(2)}`
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
