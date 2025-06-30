import { compareAddress, formatDisplay, getNativeTokenInfoByChainId, useWallets } from '@0xsequence/connect'
import { AddIcon, Button, SendIcon, Text, TokenImage } from '@0xsequence/design-system'
import { useGetCoinPrices, useGetExchangeRate, useGetSingleTokenBalance, useGetTransactionHistory } from '@0xsequence/hooks'
import { useEffect } from 'react'
import { formatUnits, zeroAddress } from 'viem'
import { useConfig } from 'wagmi'

import { InfiniteScroll } from '../../components/InfiniteScroll.js'
import type { TokenInfo } from '../../components/NavigationHeader/index.js'
import { NetworkBadge } from '../../components/NetworkBadge.js'
import { TransactionHistoryList } from '../../components/TransactionHistoryList/index.js'
import { useNavigation, useSettings } from '../../hooks/index.js'
import { computeBalanceFiat, flattenPaginatedTransactionHistory } from '../../utils/index.js'

import { CoinDetailsSkeleton } from './Skeleton.js'

export const CoinDetails = ({ contractAddress, chainId, accountAddress = '' }: TokenInfo) => {
  const { chains } = useConfig()
  const { setNavigation } = useNavigation()
  const { fiatCurrency } = useSettings()
  const { setActiveWallet } = useWallets()

  useEffect(() => {
    setActiveWallet(accountAddress)
  }, [accountAddress])

  const isReadOnly = !chains.map(chain => chain.id).includes(chainId)

  const {
    data: dataTransactionHistory,
    isLoading: isLoadingTransactionHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetTransactionHistory({
    chainId,
    accountAddresses: [accountAddress],
    contractAddresses: [contractAddress]
  })

  const transactionHistory = flattenPaginatedTransactionHistory(dataTransactionHistory)

  const { data: tokenBalance, isLoading: isLoadingCoinBalance } = useGetSingleTokenBalance({
    chainId,
    contractAddress,
    accountAddress: accountAddress || ''
  })

  const { data: dataCoinPrices, isLoading: isLoadingCoinPrices } = useGetCoinPrices([
    {
      chainId,
      contractAddress
    }
  ])

  const { data: conversionRate = 1, isLoading: isLoadingConversionRate } = useGetExchangeRate(fiatCurrency.symbol)

  const isLoading = isLoadingCoinBalance || isLoadingCoinPrices || isLoadingConversionRate

  if (isLoading) {
    return <CoinDetailsSkeleton chainId={chainId} isReadOnly={isReadOnly} />
  }

  const isNativeToken = compareAddress(contractAddress, zeroAddress)
  const logo = isNativeToken ? getNativeTokenInfoByChainId(chainId, chains).logoURI : tokenBalance?.contractInfo?.logoURI
  const symbol = isNativeToken ? getNativeTokenInfoByChainId(chainId, chains).symbol : tokenBalance?.contractInfo?.symbol
  const name = isNativeToken ? getNativeTokenInfoByChainId(chainId, chains).name : tokenBalance?.contractInfo?.name
  const decimals = isNativeToken ? getNativeTokenInfoByChainId(chainId, chains).decimals : tokenBalance?.contractInfo?.decimals
  const formattedBalance = formatUnits(BigInt(tokenBalance?.balance || '0'), decimals || 18)
  const balanceDisplayed = formatDisplay(formattedBalance)

  const coinBalanceFiat = tokenBalance
    ? computeBalanceFiat({
        balance: tokenBalance,
        prices: dataCoinPrices || [],
        conversionRate,
        decimals: decimals || 18
      })
    : '0'

  const onClickSend = () => {
    setNavigation({
      location: 'send-coin',
      params: {
        chainId,
        contractAddress
      }
    })
  }

  const onClickAdd = () => {
    setNavigation({
      location: 'swap-coin',
      params: {
        chainId,
        contractAddress
      }
    })
  }
  return (
    <div>
      <div className="flex flex-col gap-10 pb-5 px-4 pt-0">
        <div className="flex mb-10 gap-2 items-center justify-center flex-col">
          <TokenImage src={logo} size="xl" />
          <Text variant="large" color="primary" fontWeight="bold">
            {name}
          </Text>
          <NetworkBadge chainId={chainId} />
        </div>
        <div>
          <Text variant="normal" fontWeight="medium" color="muted">
            Balance
          </Text>
          <div className="flex flex-row items-end justify-between">
            <Text variant="xlarge" fontWeight="bold" color="primary">{`${balanceDisplayed} ${symbol}`}</Text>
            <Text variant="normal" fontWeight="medium" color="muted">{`${fiatCurrency.sign}${coinBalanceFiat}`}</Text>
          </div>
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <Button
              className="w-full text-primary bg-background-secondary"
              leftIcon={SendIcon}
              label="Send"
              onClick={onClickSend}
            />
            <Button className="w-full text-primary bg-background-secondary" leftIcon={AddIcon} label="Add" onClick={onClickAdd} />
          </div>
        )}
        <div>
          <InfiniteScroll onLoad={() => fetchNextPage()} hasMore={hasNextPage}>
            <TransactionHistoryList
              transactions={transactionHistory}
              isLoading={isLoadingTransactionHistory}
              isFetchingNextPage={isFetchingNextPage}
            />
          </InfiniteScroll>
        </div>
      </div>
    </div>
  )
}
