import React from 'react'
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'
import { Box, Button, Image, SendIcon, Text } from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId } from '@0xsequence/kit-core'

import { CollectibleDetailsSkeleton } from './Skeleton'

import {
  computeBalanceFiat,
  formatDisplay,
  flattenPaginatedTransactionHistory
} from '../../utils'
import {
  useCollectiblePrices,
  useCollectibleBalance,
  useSettings,
  useTransactionHistory,
  useNavigation,
  useConversionRate,
} from '../../hooks'
import { InfiniteScroll } from '../../shared/InfiniteScroll'
import { TransactionHistoryList } from '../../shared/TransactionHistoryList'
import { CollectibleTileImage } from '../../shared/CollectibleTileImage'
import { HEADER_HEIGHT } from '../../constants'

export interface CollectibleDetailsProps {
  contractAddress: string
  chainId: number
  tokenId: string
}

export const CollectibleDetails = ({
  contractAddress,
  chainId,
  tokenId,
}: CollectibleDetailsProps) => {
  const { address: accountAddress } = useAccount()
  const { fiatCurrency } = useSettings()
  const { setNavigation } = useNavigation()

  const {
    data: dataTransactionHistory,
    isLoading: isLoadingTransactionHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactionHistory({
    chainId,
    accountAddress: accountAddress || '',
    contractAddress,
    tokenId
  })

  const transactionHistory = flattenPaginatedTransactionHistory(dataTransactionHistory)

  const { data: dataCollectibleBalance, isLoading: isLoadingCollectibleBalance } = useCollectibleBalance({
    accountAddress: accountAddress || '',
    collectionAddress: contractAddress,
    chainId,
    tokenId,
  })

  const { data: dataCollectiblePrices, isLoading: isLoadingCollectiblePrices } = useCollectiblePrices({
    tokens: [{
      chainId,
      contractAddress,
      tokenId
    }]
  })

  const {
    data: conversionRate = 1,
    isLoading: isLoadingConversionRate
  } = useConversionRate({
    toCurrency: fiatCurrency.symbol
  })

  const isLoading = isLoadingCollectibleBalance || isLoadingCollectiblePrices || isLoadingConversionRate

  if (isLoading) {
    return (
      <CollectibleDetailsSkeleton />
    )
  }

  const onClickSend = () => {
    setNavigation({
      location: 'send-collectible',
      params: {
        chainId,
        contractAddress,
        tokenId,
      }
    })
  }

  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId)
  const collectionLogo = dataCollectibleBalance?.contractInfo?.logoURI
  const collectionName = dataCollectibleBalance?.contractInfo?.name || 'Unknown Collection'

  const decimals = dataCollectibleBalance?.tokenMetadata?.decimals || 0
  const rawBalance = dataCollectibleBalance?.balance || '0'
  const balance = ethers.utils.formatUnits(rawBalance, decimals)
  const formattedBalance = formatDisplay(Number(balance))

  const valueFiat = dataCollectibleBalance ? computeBalanceFiat(dataCollectibleBalance, dataCollectiblePrices || [], conversionRate) : '0'
  
  return (
    <Box style={{ paddingTop: HEADER_HEIGHT }}>
      <Box flexDirection="column" gap="10" padding="5" paddingTop="0" style={{ marginTop: '-20px' }}>
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
              <Text fontWeight="bold" fontSize="small">{collectionName}</Text>
              <Image width="3" src={nativeTokenInfo.logoURI} alt="collection logo" />
            </Box>
          </Box>
          <Box flexDirection="column" justifyContent="center" alignItems="center">
            <Text
              color="text100"
              fontWeight="bold"
              fontSize="large"
            >
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
            <Text fontWeight="medium" color="text50" fontSize="normal">Balance</Text>
            <Box flexDirection="row" alignItems="flex-end" justifyContent="space-between">
              <Text
                fontWeight='bold'
                color='text100'
                fontSize='xlarge'
              >
                {formattedBalance}
              </Text>
              {dataCollectiblePrices && dataCollectiblePrices[0].price?.value &&(
                <Text fontWeight="medium" color="text50" fontSize="normal">{`${fiatCurrency.symbol} ${valueFiat}`}</Text>
              )}
            </Box>
          </Box>
          <Button
            marginTop="4"
            width="full"
            variant="primary"
            leftIcon={SendIcon}
            label="Send"
            onClick={onClickSend}
          />
        </Box>
        <Box>
          <InfiniteScroll
            onLoad={() => fetchNextPage()}
            hasMore={hasNextPage}
          >
            <TransactionHistoryList
              transactions={transactionHistory}
              isLoading={isLoadingTransactionHistory}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
            />
          </InfiniteScroll>
        </Box>
      </Box>
    </Box>
  )
}