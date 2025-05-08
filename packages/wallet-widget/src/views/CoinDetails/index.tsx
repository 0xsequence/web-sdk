import { compareAddress, formatDisplay, getNativeTokenInfoByChainId, useWallets } from '@0xsequence/connect'
import { Button, SendIcon, SwapIcon, Text, TokenImage } from '@0xsequence/design-system'
import { useGetCoinPrices, useGetExchangeRate, useGetSingleTokenBalance, useGetTransactionHistory } from '@0xsequence/hooks'
import { useEffect } from 'react'
import { formatUnits, zeroAddress } from 'viem'
import { useConfig } from 'wagmi'

import { InfiniteScroll } from '../../components/InfiniteScroll'
import { NetworkBadge } from '../../components/NetworkBadge'
import { TransactionHistoryList } from '../../components/TransactionHistoryList'
import { HEADER_HEIGHT } from '../../constants'
import { useNavigation, useSettings } from '../../hooks'
import { computeBalanceFiat, flattenPaginatedTransactionHistory } from '../../utils'

import { CoinDetailsSkeleton } from './Skeleton'

export interface CoinDetailsProps {
  contractAddress: string
  chainId: number
  accountAddress: string
}

export const CoinDetails = ({ contractAddress, chainId, accountAddress }: CoinDetailsProps) => {
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

  const onClickSwap = () => {
    setNavigation({
      location: 'swap-coin',
      params: {
        chainId,
        contractAddress
      }
    })
  }
  return (
    <div style={{ paddingTop: HEADER_HEIGHT }}>
      <div className="flex flex-col gap-10 pb-5 px-4 pt-0" style={{ marginTop: '-20px' }}>
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
            <Button className="w-full text-primary" variant="primary" leftIcon={SendIcon} label="Send" onClick={onClickSend} />
            <Button className="w-full text-primary" variant="primary" leftIcon={SwapIcon} label="Swap" onClick={onClickSwap} />
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
