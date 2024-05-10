import React from 'react'
import { ethers } from 'ethers'
import { useAccount, useConfig } from 'wagmi'
import { Box, Button, Image, NetworkImage, SendIcon, Text } from '@0xsequence/design-system'
import {
  getNativeTokenInfoByChainId,
  useExchangeRate,
  useTransactionHistory,
  useCollectiblePrices,
  useCollectibleBalance
} from '@0xsequence/kit'

import { CollectibleDetailsSkeleton } from './Skeleton'

import { computeBalanceFiat, formatDisplay, flattenPaginatedTransactionHistory } from '../../utils'
import { useSettings, useNavigation } from '../../hooks'
import { InfiniteScroll } from '../../shared/InfiniteScroll'
import { TransactionHistoryList } from '../../shared/TransactionHistoryList'
import { CollectibleTileImage } from '../../shared/CollectibleTileImage'
import { HEADER_HEIGHT } from '../../constants'
import { useScrollbarWidth } from '../../hooks/useScrollbarWidth'

export interface CollectibleDetailsProps {
  contractAddress: string
  chainId: number
  tokenId: string
}

export const CollectibleDetails = ({ contractAddress, chainId, tokenId }: CollectibleDetailsProps) => {
  const { chains } = useConfig()
  const { address: accountAddress } = useAccount()
  const { fiatCurrency } = useSettings()
  const { setNavigation } = useNavigation()
  const scrollbarWidth = useScrollbarWidth()

  const {
    data: dataTransactionHistory,
    isPending: isPendingTransactionHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTransactionHistory({
    chainId,
    accountAddress: accountAddress || '',
    contractAddress,
    tokenId
  })

  const transactionHistory = flattenPaginatedTransactionHistory(dataTransactionHistory)

  const { data: dataCollectibleBalance, isPending: isPendingCollectibleBalance } = useCollectibleBalance({
    accountAddress: accountAddress || '',
    contractAddress,
    chainId,
    tokenId,
    verifiedOnly: false
  })

  const { data: dataCollectiblePrices, isPending: isPendingCollectiblePrices } = useCollectiblePrices([
    {
      chainId,
      contractAddress,
      tokenId
    }
  ])

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useExchangeRate(fiatCurrency.symbol)

  const isPending = isPendingCollectibleBalance || isPendingCollectiblePrices || isPendingConversionRate

  if (isPending) {
    return <CollectibleDetailsSkeleton />
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

  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, chains)
  const collectionLogo = dataCollectibleBalance?.contractInfo?.logoURI
  const collectionName = dataCollectibleBalance?.contractInfo?.name || 'Unknown Collection'

  const decimals = dataCollectibleBalance?.tokenMetadata?.decimals || 0
  const rawBalance = dataCollectibleBalance?.balance || '0'
  const balance = ethers.utils.formatUnits(rawBalance, decimals)
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
    <Box style={{ paddingTop: HEADER_HEIGHT }}>
      <Box
        flexDirection="column"
        gap="10"
        paddingBottom="5"
        paddingX="4"
        paddingTop="0"
        style={{
          marginTop: '-20px'
        }}
      >
        <Box gap="3" alignItems="center" justifyContent="center" flexDirection="column">
          <Box flexDirection="row" gap="2" justifyContent="center" alignItems="center">
            <Image
              borderRadius="circle"
              width="8"
              src={collectionLogo}
              alt="collection logo"
              style={{
                objectFit: 'cover'
              }}
            />
            <Box gap="1" flexDirection="row" justifyContent="center" alignItems="center">
              <Text fontWeight="bold" fontSize="small" color="text100">
                {collectionName}
              </Text>
              <NetworkImage chainId={chainId} size="xs" />
            </Box>
          </Box>
          <Box flexDirection="column" justifyContent="center" alignItems="center">
            <Text color="text100" fontWeight="bold" fontSize="large">
              {dataCollectibleBalance?.tokenMetadata?.name || 'Unknown Collectible'}
            </Text>
            <Text color="text50" fontSize="small" fontWeight="medium">
              {`#${tokenId}`}
            </Text>
          </Box>
        </Box>
        <Box>
          <CollectibleTileImage imageUrl={dataCollectibleBalance?.tokenMetadata?.image} />
        </Box>
        <Box>
          {/* balance */}
          <Box>
            <Text fontWeight="medium" color="text50" fontSize="normal">
              Balance
            </Text>
            <Box flexDirection="row" alignItems="flex-end" justifyContent="space-between">
              <Text fontWeight="bold" color="text100" fontSize="xlarge">
                {formattedBalance}
              </Text>
              {dataCollectiblePrices && dataCollectiblePrices[0].price?.value && (
                <Text fontWeight="medium" color="text50" fontSize="normal">{`${fiatCurrency.symbol} ${valueFiat}`}</Text>
              )}
            </Box>
          </Box>
          <Button
            color="text100"
            marginTop="4"
            width="full"
            variant="primary"
            leftIcon={SendIcon}
            label="Send"
            onClick={onClickSend}
          />
        </Box>
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
