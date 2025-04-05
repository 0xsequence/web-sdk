import { formatDisplay, ContractVerificationStatus, useWallets } from '@0xsequence/connect'
import { Button, Image, NetworkImage, SendIcon, Text } from '@0xsequence/design-system'
import {
  useGetTokenBalancesDetails,
  useGetTransactionHistory,
  useGetCollectiblePrices,
  useGetExchangeRate
} from '@0xsequence/hooks'
import { useEffect } from 'react'
import { formatUnits } from 'viem'
import { useConfig } from 'wagmi'

import { CollectibleTileImage } from '../../components/CollectibleTileImage'
import { InfiniteScroll } from '../../components/InfiniteScroll'
import { TransactionHistoryList } from '../../components/TransactionHistoryList'
import { HEADER_HEIGHT } from '../../constants'
import { useSettings, useNavigation } from '../../hooks'
import { computeBalanceFiat, flattenPaginatedTransactionHistory } from '../../utils'

import { CollectibleDetailsSkeleton } from './Skeleton'
export interface CollectibleDetailsProps {
  contractAddress: string
  chainId: number
  tokenId: string
  accountAddress: string
}

export const CollectibleDetails = ({ contractAddress, chainId, tokenId, accountAddress }: CollectibleDetailsProps) => {
  const { chains } = useConfig()
  const { setActiveWallet } = useWallets()
  const { fiatCurrency } = useSettings()
  const { setNavigation } = useNavigation()

  useEffect(() => {
    setActiveWallet(accountAddress || '')
  }, [accountAddress])

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
    contractAddress,
    tokenId
  })

  const transactionHistory = flattenPaginatedTransactionHistory(dataTransactionHistory)

  const { data: dataTokens, isPending: isPendingCollectibleBalance } = useGetTokenBalancesDetails({
    filter: {
      accountAddresses: accountAddress ? [accountAddress] : [],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [contractAddress],
      omitNativeBalances: true
    },
    chainIds: [chainId]
  })

  const dataCollectibleBalance =
    dataTokens && dataTokens.length > 0 ? dataTokens.find(token => token.tokenID === tokenId) : undefined

  const { data: dataCollectiblePrices, isPending: isPendingCollectiblePrices } = useGetCollectiblePrices([
    {
      chainId,
      contractAddress,
      tokenId
    }
  ])

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useGetExchangeRate(fiatCurrency.symbol)

  const isPending = isPendingCollectibleBalance || isPendingCollectiblePrices || isPendingConversionRate

  if (isPending) {
    return <CollectibleDetailsSkeleton isReadOnly={isReadOnly} />
  }

  const onClickSend = () => {
    setNavigation({
      location: 'send-collectible',
      params: {
        chainId,
        contractAddress,
        tokenId
      }
    })
  }

  const collectionLogo = dataCollectibleBalance?.contractInfo?.logoURI
  const collectionName = dataCollectibleBalance?.contractInfo?.name || 'Unknown Collection'

  const decimals = dataCollectibleBalance?.tokenMetadata?.decimals || 0
  const rawBalance = dataCollectibleBalance?.balance || '0'
  const balance = formatUnits(BigInt(rawBalance), decimals)
  const formattedBalance = formatDisplay(Number(balance))

  const valueFiat = dataCollectibleBalance
    ? computeBalanceFiat({
        balance: dataCollectibleBalance,
        prices: dataCollectiblePrices || [],
        conversionRate,
        decimals: decimals
      })
    : '0'

  return (
    <div style={{ paddingTop: HEADER_HEIGHT }}>
      <div
        className="flex flex-col gap-10 pb-5 px-4 pt-0"
        style={{
          marginTop: '-20px'
        }}
      >
        <div className="flex gap-3 items-center justify-center flex-col">
          <div className="flex flex-row gap-2 justify-center items-center">
            {collectionLogo && (
              <Image
                className="rounded-full w-8"
                src={collectionLogo}
                alt="collection logo"
                style={{
                  objectFit: 'cover'
                }}
              />
            )}
            <div className="flex gap-1 flex-row justify-center items-center">
              <Text variant="small" fontWeight="bold" color="primary">
                {collectionName}
              </Text>
              <NetworkImage chainId={chainId} size="xs" />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <Text variant="large" color="primary" fontWeight="bold">
              {dataCollectibleBalance?.tokenMetadata?.name || 'Unknown Collectible'}
            </Text>
            <Text variant="small" color="muted" fontWeight="medium">
              {`#${tokenId}`}
            </Text>
          </div>
        </div>
        <div>
          <CollectibleTileImage imageUrl={dataCollectibleBalance?.tokenMetadata?.image} />
        </div>
        <div>
          {/* balance */}
          <div>
            <Text variant="normal" fontWeight="medium" color="muted">
              Balance
            </Text>
            <div className="flex flex-row items-end justify-between">
              <Text variant="xlarge" fontWeight="bold" color="primary">
                {formattedBalance}
              </Text>
              {dataCollectiblePrices && dataCollectiblePrices[0].price?.value && (
                <Text variant="normal" fontWeight="medium" color="muted">{`${fiatCurrency.symbol} ${valueFiat}`}</Text>
              )}
            </div>
          </div>
          {!isReadOnly && (
            <Button
              className="text-primary mt-4 w-full"
              variant="primary"
              leftIcon={SendIcon}
              label="Send"
              onClick={onClickSend}
            />
          )}
        </div>
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
