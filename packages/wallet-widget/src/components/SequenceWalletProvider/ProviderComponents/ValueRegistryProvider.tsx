import { compareAddress, useWallets } from '@0xsequence/connect'
import { useGetCoinPrices, useGetExchangeRate } from '@0xsequence/hooks'
import { useEffect, useState, type ReactNode } from 'react'
import { getAddress, zeroAddress } from 'viem'

import { ValueRegistryContextProvider, type ValueRegistryPair } from '../../../contexts/index.js'
import { useGetAllTokensDetails, useSettings } from '../../../hooks/index.js'
import { computeBalanceFiat } from '../../../utils/index.js'

export const ValueRegistryProvider = ({ children }: { children: ReactNode }) => {
  const { wallets } = useWallets()
  const { allNetworks, hideUnlistedTokens, fiatCurrency } = useSettings()

  const [valueRegistryMap, setValueRegistryMap] = useState<ValueRegistryPair[]>([])
  const [totalValue, setTotalValue] = useState<string>('0')

  const { data: tokenBalancesData, isLoading: isTokenBalancesLoading } = useGetAllTokensDetails({
    accountAddresses: wallets.map(wallet => wallet.address),
    chainIds: allNetworks,
    hideUnlistedTokens
  })

  const coinBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC20' || compareAddress(b.contractAddress, zeroAddress)) || []

  const { data: coinPrices = [], isLoading: isCoinPricesLoading } = useGetCoinPrices(
    coinBalancesUnordered.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  )

  const { data: conversionRate, isLoading: isConversionRateLoading } = useGetExchangeRate(fiatCurrency.symbol)

  useEffect(() => {
    if (
      !isTokenBalancesLoading &&
      !isCoinPricesLoading &&
      !isConversionRateLoading &&
      coinBalancesUnordered.length > 0 &&
      coinPrices.length > 0 &&
      conversionRate
    ) {
      const newValueRegistryMap = wallets.map(wallet => {
        const walletBalances = coinBalancesUnordered.filter(b => getAddress(b.accountAddress) === getAddress(wallet.address))
        const walletFiatValue = walletBalances.reduce((acc, coin) => {
          return (
            acc +
            Number(
              computeBalanceFiat({
                balance: coin,
                prices: coinPrices,
                conversionRate,
                decimals: coin.contractInfo?.decimals || 18
              })
            )
          )
        }, 0)
        return {
          accountAddress: wallet.address,
          value: walletFiatValue.toFixed(2)
        } as ValueRegistryPair
      })

      if (JSON.stringify(newValueRegistryMap) !== JSON.stringify(valueRegistryMap)) {
        setValueRegistryMap(newValueRegistryMap)
        const totalValue = newValueRegistryMap.reduce((acc, wallet) => acc + Number(wallet.value), 0).toFixed(2)
        setTotalValue(totalValue)
      }
    }
  }, [coinBalancesUnordered, coinPrices, conversionRate])

  return <ValueRegistryContextProvider value={{ valueRegistryMap, totalValue }}>{children}</ValueRegistryContextProvider>
}
