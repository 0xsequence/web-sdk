import React from 'react'
import { ethers } from 'ethers'
import { Box, Button, Image, SendIcon, Text } from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId, useExchangeRate, useCoinPrices } from '@0xsequence/kit'

import { useAccount, useConfig } from 'wagmi'

import { CoinDetailsSkeleton } from './Skeleton'

import { InfiniteScroll } from '../../shared/InfiniteScroll'
import { NetworkBadge } from '../../shared/NetworkBadge'
import { TransactionHistoryList } from '../../shared/TransactionHistoryList'
import { useCoinBalance, useSettings, useTransactionHistory, useNavigation } from '../../hooks'
import { HEADER_HEIGHT } from '../../constants'
import { compareAddress, computeBalanceFiat, formatDisplay, flattenPaginatedTransactionHistory } from '../../utils'
import { useScrollbarWidth } from '../../hooks/useScrollbarWidth'

export interface CoinDetailsProps {
  contractAddress: string
  chainId: number
}

export const CoinDetails = ({ contractAddress, chainId }: CoinDetailsProps) => {
  const { chains } = useConfig()
  const { setNavigation } = useNavigation()
  const { fiatCurrency, hideUnlistedTokens } = useSettings()
  const scrollbarWidth = useScrollbarWidth()

  const { address: accountAddress } = useAccount()

  const {
    data: dataTransactionHistory,
    isPending: isPendingTransactionHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTransactionHistory({
    chainId,
    accountAddress: accountAddress || '',
    contractAddress
  })

  const transactionHistory = flattenPaginatedTransactionHistory(dataTransactionHistory)

  const { data: dataCoinBalance, isPending: isPendingCoinBalance } = useCoinBalance(
    {
      accountAddress: accountAddress || '',
      contractAddress,
      chainId
    },
    { hideUnlistedTokens }
  )

  const { data: dataCoinPrices, isPending: isPendingCoinPrices } = useCoinPrices([
    {
      chainId,
      contractAddress
    }
  ])

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useExchangeRate(fiatCurrency.symbol)

  const isPending = isPendingCoinBalance || isPendingCoinPrices || isPendingConversionRate

  if (isPending) {
    return <CoinDetailsSkeleton chainId={chainId} />
  }

  const isNativeToken = compareAddress(contractAddress, ethers.constants.AddressZero)
  const logo = isNativeToken ? getNativeTokenInfoByChainId(chainId, chains).logoURI : dataCoinBalance?.contractInfo?.logoURI
  const symbol = isNativeToken ? getNativeTokenInfoByChainId(chainId, chains).symbol : dataCoinBalance?.contractInfo?.symbol
  const name = isNativeToken ? getNativeTokenInfoByChainId(chainId, chains).name : dataCoinBalance?.contractInfo?.name
  const decimals = isNativeToken ? getNativeTokenInfoByChainId(chainId, chains).decimals : dataCoinBalance?.contractInfo?.decimals
  const formattedBalance = ethers.utils.formatUnits(dataCoinBalance?.balance || '0', decimals)
  const balanceDisplayed = formatDisplay(formattedBalance)

  const coinBalanceFiat = dataCoinBalance
    ? computeBalanceFiat({
        balance: dataCoinBalance,
        prices: dataCoinPrices || [],
        conversionRate,
        decimals: decimals || 0
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

  return (
    <Box style={{ paddingTop: HEADER_HEIGHT }}>
      <Box flexDirection="column" gap="10" paddingBottom="5" paddingX="4" paddingTop="0" style={{ marginTop: '-20px' }}>
        <Box marginBottom="10" gap="2" alignItems="center" justifyContent="center" flexDirection="column">
          <Image width="8" src={logo} alt="logo" />
          <Text color="text100" fontWeight="bold" fontSize="large">
            {name}
          </Text>
          <NetworkBadge chainId={chainId} />
        </Box>
        <Box>
          <Text fontWeight="medium" color="text50" fontSize="normal">
            Balance
          </Text>
          <Box flexDirection="row" alignItems="flex-end" justifyContent="space-between">
            <Text fontWeight="bold" color="text100" fontSize="xlarge">{`${balanceDisplayed} ${symbol}`}</Text>
            <Text fontWeight="medium" color="text50" fontSize="normal">{`${fiatCurrency.sign}${coinBalanceFiat}`}</Text>
          </Box>
        </Box>
        <Button width="full" variant="primary" leftIcon={SendIcon} color="text100" label="Send" onClick={onClickSend} />
        <Box>
          <InfiniteScroll onLoad={() => fetchNextPage()} hasMore={hasNextPage}>
            <TransactionHistoryList
              transactions={transactionHistory}
              isPending={isPendingTransactionHistory}
              isFetchingNextPage={isFetchingNextPage}
            />
          </InfiniteScroll>
        </Box>
      </Box>
    </Box>
  )
}
