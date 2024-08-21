import { Token } from '@0xsequence/api'
import {
  ArrowRightIcon,
  Box,
  Button,
  Divider,
  GradientAvatar,
  LinkIcon,
  NetworkImage,
  Skeleton,
  Text,
  TokenImage
} from '@0xsequence/design-system'
import { Transaction, TxnTransfer } from '@0xsequence/indexer'
import { getNativeTokenInfoByChainId, useExchangeRate, useCoinPrices, useCollectiblePrices } from '@0xsequence/kit'
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import React from 'react'
import { useConfig } from 'wagmi'

import { useSettings } from '../../hooks'
import { CopyButton } from '../../shared/CopyButton'
import { NetworkBadge } from '../../shared/NetworkBadge'
import { compareAddress, formatDisplay } from '../../utils'

interface TransactionDetailProps {
  transaction: Transaction
}

export const TransactionDetails = ({ transaction }: TransactionDetailProps) => {
  const { chains } = useConfig()
  const { fiatCurrency } = useSettings()

  const coins: Token[] = []
  const collectibles: Token[] = []
  transaction.transfers?.forEach(transfer => {
    if (transfer.contractInfo?.type === 'ERC721' || transfer.contractInfo?.type === 'ERC1155') {
      transfer.tokenIds?.forEach(tokenId => {
        const foundCollectible = collectibles.find(
          collectible =>
            collectible.chainId === transaction.chainId &&
            compareAddress(collectible.contractAddress, transfer.contractInfo?.address || '') &&
            collectible.tokenId === tokenId
        )
        if (!foundCollectible) {
          collectibles.push({
            chainId: transaction.chainId,
            contractAddress: transfer.contractInfo?.address || '',
            tokenId
          })
        }
      })
    } else {
      const contractAddress = transfer?.contractInfo?.address || ethers.ZeroAddress
      const foundCoin = coins.find(
        coin => coin.chainId === transaction.chainId && compareAddress(coin.contractAddress, contractAddress)
      )
      if (!foundCoin) {
        coins.push({
          chainId: transaction.chainId,
          contractAddress
        })
      }
    }
  })

  const { data: coinPricesData, isPending: isPendingCoinPrices } = useCoinPrices(coins)

  const { data: collectiblePricesData, isPending: isPendingCollectiblePrices } = useCollectiblePrices(collectibles)

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useExchangeRate(fiatCurrency.symbol)

  const arePricesLoading =
    (coins.length > 0 && isPendingCoinPrices) ||
    (collectibles.length > 0 && isPendingCollectiblePrices) ||
    isPendingConversionRate

  const nativeTokenInfo = getNativeTokenInfoByChainId(transaction.chainId, chains)

  const date = dayjs(transaction.timestamp).format('ddd MMM DD YYYY, h:m:s a')

  const onClickBlockExplorer = () => {
    if (typeof window !== 'undefined') {
      window.open(`${nativeTokenInfo.blockExplorerUrl}/tx/${transaction.txnHash}`, '_blank')
    }
  }

  interface TransferProps {
    transfer: TxnTransfer
  }
  const Transfer = ({ transfer }: TransferProps) => {
    const recipientAddress = transfer.to
    const recipientAddressFormatted =
      recipientAddress.substring(0, 10) + '...' + recipientAddress.substring(transfer.to.length - 4, transfer.to.length)
    const isNativeToken = compareAddress(transfer?.contractInfo?.address || '', ethers.ZeroAddress)
    const logoURI = isNativeToken ? nativeTokenInfo.logoURI : transfer?.contractInfo?.logoURI
    const symbol = isNativeToken ? nativeTokenInfo.symbol : transfer?.contractInfo?.symbol || ''

    return (
      <>
        {transfer.amounts?.map((amount, index) => {
          const isCollectible = transfer.contractType === 'ERC721' || transfer.contractType === 'ERC1155'
          const tokenId = transfer.tokenIds?.[index] || '0'
          const collectibleDecimals = transfer?.tokenMetadata?.[tokenId]?.decimals || 0
          const coinDecimals = isNativeToken ? nativeTokenInfo.decimals : transfer?.contractInfo?.decimals || 0
          const decimals = isCollectible ? collectibleDecimals : coinDecimals
          const formattedBalance = ethers.formatUnits(amount, decimals)
          const balanceDisplayed = formatDisplay(formattedBalance)
          const fiatPrice = isCollectible
            ? collectiblePricesData?.find(
                collectible =>
                  compareAddress(collectible.token.contractAddress, transfer.contractInfo?.address || '') &&
                  collectible.token.tokenId === transfer.tokenIds?.[index] &&
                  collectible.token.chainId === transaction.chainId
              )?.price?.value
            : coinPricesData?.find(
                coin =>
                  compareAddress(coin.token.contractAddress, transfer.contractInfo?.address || ethers.ZeroAddress) &&
                  coin.token.chainId === transaction.chainId
              )?.price?.value

          const fiatValue = (parseFloat(formattedBalance) * (conversionRate * (fiatPrice || 0))).toFixed(2)

          return (
            <Box key={index} width="full" flexDirection="row" gap="2" justifyContent="space-between" alignItems="center">
              <Box
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
                gap="2"
                height="12"
                borderRadius="md"
                background="buttonGlass"
                padding="2"
                style={{ flexBasis: '100%' }}
              >
                <TokenImage src={logoURI} symbol={symbol} size="sm" />
                <Box gap="0.5" flexDirection="column" alignItems="flex-start" justifyContent="center">
                  <Text variant="xsmall" fontWeight="bold" color="text100">
                    {`${balanceDisplayed} ${symbol}`}
                  </Text>
                  {arePricesLoading ? (
                    <Skeleton style={{ width: '44px', height: '12px' }} />
                  ) : (
                    <Text variant="xsmall" fontWeight="bold" color="text50">
                      {fiatPrice ? `${fiatCurrency.sign}${fiatValue}` : ''}
                    </Text>
                  )}
                </Box>
              </Box>
              <ArrowRightIcon color="text50" style={{ width: '16px' }} />
              <Box
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
                gap="2"
                height="12"
                borderRadius="md"
                background="buttonGlass"
                padding="2"
                style={{ flexBasis: '100%' }}
              >
                <GradientAvatar address={recipientAddress} style={{ width: '20px' }} />
                <Text variant="xsmall" fontWeight="bold" color="text100">
                  {recipientAddressFormatted}
                </Text>
              </Box>
            </Box>
          )
        })}
      </>
    )
  }

  return (
    <Box padding="5" paddingTop="3" flexDirection="column" alignItems="center" justifyContent="center" gap="10" marginTop="5">
      <Box marginTop="6" flexDirection="column" justifyContent="center" alignItems="center" gap="1">
        <Text variant="normal" fontWeight="medium" color="text100">
          Transaction details
        </Text>
        <Text variant="small" marginBottom="1" fontWeight="medium" color="text50">
          {date}
        </Text>
        <NetworkBadge chainId={transaction.chainId} />
      </Box>
      <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="4"
        width="full"
        padding="4"
        background="backgroundSecondary"
        borderRadius="md"
      >
        <Box width="full" gap="1" flexDirection="row" alignItems="center" justifyContent="flex-start">
          <Text variant="normal" fontWeight="medium" color="text50">
            Transfer
          </Text>
          <NetworkImage chainId={transaction.chainId} size="xs" />
        </Box>
        {transaction.transfers?.map((transfer, index) => (
          <Box width="full" flexDirection="column" justifyContent="center" alignItems="center" gap="4" key={`transfer-${index}`}>
            <Transfer transfer={transfer} />
          </Box>
        ))}
      </Box>

      <Button
        onClick={onClickBlockExplorer}
        width="full"
        borderRadius="md"
        rightIcon={LinkIcon}
        label={`View on ${nativeTokenInfo.blockExplorerName}`}
      />
      <Box>
        <Box width="full" flexDirection="column" gap="2" justifyContent="center" alignItems="flex-start">
          <Divider width="full" margin="0" style={{ marginBottom: '-4px' }} />
          <Text variant="normal" color="text50" fontWeight="medium">
            Status
          </Text>
          <Text variant="normal" fontWeight="medium" color="text100">
            Complete
          </Text>
        </Box>
        <Box width="full" flexDirection="column" gap="2" justifyContent="center" alignItems="flex-start">
          <Divider width="full" margin="0" style={{ marginBottom: '-4px' }} />
          <Text variant="normal" color="text50" fontWeight="medium">
            Transaction Hash
          </Text>
          <Text variant="normal" color="text100" fontWeight="medium" style={{ overflowWrap: 'anywhere' }}>
            {transaction.txnHash}
          </Text>
          <CopyButton marginTop="2" buttonVariant="with-label" text={transaction.txnHash} />
        </Box>
      </Box>
    </Box>
  )
}
