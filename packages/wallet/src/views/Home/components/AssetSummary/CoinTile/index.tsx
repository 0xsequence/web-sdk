import { Box } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import { getNativeTokenInfoByChainId, useContractInfo, useExchangeRate, useCoinPrices } from '@0xsequence/kit'
import { ethers } from 'ethers'
import React from 'react'
import { useConfig } from 'wagmi'


import { useSettings } from '../../../../../hooks'
import { computeBalanceFiat, formatDisplay, getPercentagePriceChange, compareAddress } from '../../../../../utils'

import { CoinTileContent } from './CoinTileContent'

interface CoinTileProps {
  balance: TokenBalance
}

export const CoinTile = ({ balance }: CoinTileProps) => {
  const { chains } = useConfig()
  const { fiatCurrency } = useSettings()
  const isNativeToken = compareAddress(balance.contractAddress, ethers.constants.AddressZero)
  const nativeTokenInfo = getNativeTokenInfoByChainId(balance.chainId, chains)

  const { data: dataCoinPrices = [], isPending: isPendingCoinPrice } = useCoinPrices([
    {
      chainId: balance.chainId,
      contractAddress: balance.contractAddress
    }
  ])

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useExchangeRate(fiatCurrency.symbol)

  const { data: contractInfo, isPending: isPendingContractInfo } = useContractInfo(balance.chainId, balance.contractAddress)

  const isPending = isPendingCoinPrice || isPendingConversionRate || isPendingContractInfo
  if (isPending) {
    return <Box background="backgroundSecondary" width="full" height="full" borderRadius="md" />
  }

  if (isNativeToken) {
    const computedBalance = computeBalanceFiat({
      balance,
      prices: dataCoinPrices,
      conversionRate,
      decimals: nativeTokenInfo.decimals
    })
    const priceChangePercentage = getPercentagePriceChange(balance, dataCoinPrices)
    const formattedBalance = ethers.utils.formatUnits(balance.balance, nativeTokenInfo.decimals)
    const balanceDisplayed = formatDisplay(formattedBalance)

    return (
      <CoinTileContent
        chainId={balance.chainId}
        logoUrl={nativeTokenInfo.logoURI}
        tokenName={nativeTokenInfo.name}
        balance={balanceDisplayed}
        balanceFiat={computedBalance}
        priceChangePercentage={priceChangePercentage}
        symbol={nativeTokenInfo.symbol}
      />
    )
  }

  const decimals = contractInfo?.decimals ?? 18

  const computedBalance = computeBalanceFiat({
    balance,
    prices: dataCoinPrices,
    conversionRate,
    decimals
  })
  const priceChangePercentage = getPercentagePriceChange(balance, dataCoinPrices)

  const formattedBalance = ethers.utils.formatUnits(balance.balance, decimals)
  const balanceDisplayed = formatDisplay(formattedBalance)

  const name = contractInfo?.name || 'Unknown'
  const symbol = contractInfo?.name || 'TOKEN'
  const url = contractInfo?.logoURI

  return (
    <CoinTileContent
      chainId={balance.chainId}
      logoUrl={url}
      tokenName={name}
      balance={balanceDisplayed}
      balanceFiat={computedBalance}
      priceChangePercentage={priceChangePercentage}
      symbol={symbol}
    />
  )
}
