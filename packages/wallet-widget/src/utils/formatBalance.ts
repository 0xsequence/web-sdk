import { formatDisplay } from '@0xsequence/connect'
import { getNativeTokenInfoByChainId } from '@0xsequence/connect'
import { compareAddress } from '@0xsequence/design-system'
import { Chain, formatUnits } from 'viem'
import { zeroAddress } from 'viem'

import { TokenBalanceWithPrice } from './tokens'

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

export const formatFiatBalance = (balance: string, price: number, decimals: number, fiatSign: string) => {
  if (!balance) {
    return ''
  }

  const bal = formatUnits(BigInt(Number(balance)), decimals || 18)

  return `${fiatSign}${(price * Number(bal)).toFixed(2)}`
}

export const decimalsToWei = (balance: string, decimals: number) => {
  const scaledBalance = Number(balance) * Math.pow(10, decimals)

  const balanceBigInt = BigInt(scaledBalance)

  return balanceBigInt.toString()
}
