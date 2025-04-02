import { compareAddress, ContractVerificationStatus, useWallets } from '@0xsequence/connect'
import { useGetExchangeRate, useGetCoinPrices, useGetTokenBalancesDetails } from '@0xsequence/hooks'
import { useState, ReactNode, useEffect } from 'react'
import { zeroAddress, getAddress } from 'viem'

import { FiatWalletPair, FiatWalletsMapContextProvider } from '../../../contexts'
import { useSettings } from '../../../hooks'
import { computeBalanceFiat } from '../../../utils'

// Define the provider component
export const FiatWalletsMapProvider = ({ children }: { children: ReactNode }) => {
  const { wallets } = useWallets()
  const { selectedNetworks, hideUnlistedTokens, fiatCurrency } = useSettings()

  const [fiatWalletsMap, setFiatWalletsMap] = useState<FiatWalletPair[]>([])

  const { data: tokenBalancesData, isPending: isTokenBalancesPending } = useGetTokenBalancesDetails({
    chainIds: selectedNetworks,
    filter: {
      accountAddresses: wallets.map(wallet => wallet.address),
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      omitNativeBalances: false
    }
  })

  const coinBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC20' || compareAddress(b.contractAddress, zeroAddress)) || []

  const { data: coinPrices = [], isPending: isCoinPricesPending } = useGetCoinPrices(
    coinBalancesUnordered.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  )

  const { data: conversionRate, isPending: isConversionRatePending } = useGetExchangeRate(fiatCurrency.symbol)

  useEffect(() => {
    if (
      !isTokenBalancesPending &&
      !isCoinPricesPending &&
      !isConversionRatePending &&
      coinBalancesUnordered.length > 0 &&
      coinPrices.length > 0 &&
      conversionRate
    ) {
      const newFiatWalletsMap = wallets.map(wallet => {
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
          fiatValue: walletFiatValue.toFixed(2)
        } as FiatWalletPair
      })

      if (JSON.stringify(newFiatWalletsMap) !== JSON.stringify(fiatWalletsMap)) {
        setFiatWalletsMap(newFiatWalletsMap)
      }
    }
  }, [coinBalancesUnordered, coinPrices, conversionRate])

  return <FiatWalletsMapContextProvider value={{ fiatWalletsMap, setFiatWalletsMap }}>{children}</FiatWalletsMapContextProvider>
}
