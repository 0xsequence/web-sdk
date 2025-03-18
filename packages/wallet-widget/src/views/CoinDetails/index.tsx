import { compareAddress, formatDisplay, getNativeTokenInfoByChainId, ContractVerificationStatus } from '@0xsequence/connect'
import { Button, SendIcon, SwapIcon, Text, TokenImage } from '@0xsequence/design-system'
import { useGetTokenBalancesSummary, useGetCoinPrices, useGetExchangeRate, useGetTransactionHistory } from '@0xsequence/hooks'
import { formatUnits, zeroAddress } from 'viem'
import { useAccount, useConfig } from 'wagmi'

import { InfiniteScroll } from '../../components/InfiniteScroll'
import { NetworkBadge } from '../../components/NetworkBadge'
import { TransactionHistoryList } from '../../components/TransactionHistoryList'
import { HEADER_HEIGHT } from '../../constants'
import { useSettings, useNavigation } from '../../hooks'
import { computeBalanceFiat, flattenPaginatedTransactionHistory } from '../../utils'

import { CoinDetailsSkeleton } from './Skeleton'

export interface CoinDetailsProps {
  contractAddress: string
  chainId: number
}

export const CoinDetails = ({ contractAddress, chainId }: CoinDetailsProps) => {
  const { chains } = useConfig()
  const { setNavigation } = useNavigation()
  const { fiatCurrency, hideUnlistedTokens } = useSettings()
  const { address: accountAddress } = useAccount()

  const isReadOnly = !chains.map(chain => chain.id).includes(chainId)

  const {
    data: dataTransactionHistory,
    isPending: isPendingTransactionHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetTransactionHistory({
    chainId,
    accountAddress: accountAddress || '',
    contractAddress
  })

  const transactionHistory = flattenPaginatedTransactionHistory(dataTransactionHistory)

  const { data: tokenBalance, isPending: isPendingCoinBalance } = useGetTokenBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: [accountAddress || ''],
      contractWhitelist: [contractAddress],
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      omitNativeBalances: false
    }
  })

  const dataCoinBalance =
    tokenBalance && tokenBalance.length > 0
      ? compareAddress(contractAddress, zeroAddress)
        ? tokenBalance?.[0]
        : tokenBalance?.[1]
      : undefined

  const { data: dataCoinPrices, isPending: isPendingCoinPrices } = useGetCoinPrices([
    {
      chainId,
      contractAddress
    }
  ])

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useGetExchangeRate(fiatCurrency.symbol)

  const isPending = isPendingCoinBalance || isPendingCoinPrices || isPendingConversionRate

  if (isPending) {
    return <CoinDetailsSkeleton chainId={chainId} isReadOnly={isReadOnly} />
  }

  const isNativeToken = compareAddress(contractAddress, zeroAddress)
  const logo = isNativeToken ? getNativeTokenInfoByChainId(chainId, chains).logoURI : dataCoinBalance?.contractInfo?.logoURI
  const symbol = isNativeToken ? getNativeTokenInfoByChainId(chainId, chains).symbol : dataCoinBalance?.contractInfo?.symbol
  const name = isNativeToken ? getNativeTokenInfoByChainId(chainId, chains).name : dataCoinBalance?.contractInfo?.name
  const decimals = isNativeToken ? getNativeTokenInfoByChainId(chainId, chains).decimals : dataCoinBalance?.contractInfo?.decimals
  const formattedBalance = formatUnits(BigInt(dataCoinBalance?.balance || '0'), decimals || 18)
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
            <Button className="w-full text-primary" variant="primary" leftIcon={SwapIcon} label="Buy" onClick={onClickSwap} />
          </div>
        )}
        <div>
          <InfiniteScroll onLoad={() => fetchNextPage()} hasMore={hasNextPage}>
            <TransactionHistoryList
              transactions={transactionHistory}
              isPending={isPendingTransactionHistory}
              isFetchingNextPage={isFetchingNextPage}
            />
          </InfiniteScroll>
        </div>
      </div>
    </div>
  )
}
