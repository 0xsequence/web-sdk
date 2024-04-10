import React from 'react'
import { ethers } from 'ethers'
import { useConfig } from 'wagmi'
import { Box } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import { useContractInfo } from '../../../../../hooks'

import { CoinTileContent } from './CoinTileContent'

import { getNativeTokenInfoByChainId } from '@0xsequence/kit'

import { computeBalanceFiat, formatDisplay, getPercentagePriceChange, compareAddress } from '../../../../../utils'

import { useCoinPrices, useConversionRate, useSettings } from '../../../../../hooks'

interface CoinTileProps {
  balance: TokenBalance
}

export const CoinTile = ({ balance }: CoinTileProps) => {
  const { chains } = useConfig()
  const { fiatCurrency } = useSettings()
  const isNativeToken = compareAddress(balance.contractAddress, ethers.constants.AddressZero)
  const nativeTokenInfo = getNativeTokenInfoByChainId(balance.chainId, chains)

  const { data: dataCoinPrices = [], isLoading: isLoadingCoinPrice } = useCoinPrices({
    tokens: [
      {
        chainId: balance.chainId,
        contractAddress: balance.contractAddress
      }
    ]
  })

  const { data: conversionRate = 1, isLoading: isLoadingConversionRate } = useConversionRate({
    toCurrency: fiatCurrency.symbol
  })

  const { data: contractInfo, isLoading: isLoadingContractInfo } = useContractInfo({
    chainID: String(balance.chainId),
    contractAddress: balance.contractAddress
  })

  const isLoading = isLoadingCoinPrice || isLoadingConversionRate || isLoadingContractInfo
  if (isLoading) {
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
        networkLogoUrl={nativeTokenInfo.logoURI}
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
      networkLogoUrl={nativeTokenInfo.logoURI}
      logoUrl={url}
      tokenName={name}
      balance={balanceDisplayed}
      balanceFiat={computedBalance}
      priceChangePercentage={priceChangePercentage}
      symbol={symbol}
    />
  )
}
