import { TokenPrice } from '@0xsequence/api'
import { ArrowRightIcon, Box, Text, Image, TransactionIcon, vars, Skeleton, NetworkImage } from '@0xsequence/design-system'
import { Transaction, TxnTransfer, TxnTransferType } from '@0xsequence/indexer'
import { getNativeTokenInfoByChainId, useCoinPrices, useExchangeRate } from '@0xsequence/kit'
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import React from 'react'
import { useConfig } from 'wagmi'

import { useSettings, useNavigation } from '../../hooks'
import { formatDisplay, compareAddress } from '../../utils'

interface TransactionHistoryItemProps {
  transaction: Transaction
}

export const TransactionHistoryItem = ({ transaction }: TransactionHistoryItemProps) => {
  const { chains } = useConfig()
  const { fiatCurrency } = useSettings()
  const { setNavigation } = useNavigation()

  const onClickTransaction = () => {
    setNavigation({
      location: 'transaction-details',
      params: {
        transaction
      }
    })
  }

  const tokenContractAddresses: string[] = []

  transaction.transfers?.forEach(transfer => {
    const tokenContractAddress = transfer.contractAddress
    if (!tokenContractAddresses.includes(tokenContractAddress)) {
      tokenContractAddresses.push(tokenContractAddress)
    }
  })

  const { data: coinPrices = [], isPending: isPendingCoinPrices } = useCoinPrices(
    tokenContractAddresses.map(contractAddress => ({
      contractAddress,
      chainId: transaction.chainId
    }))
  )

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useExchangeRate(fiatCurrency.symbol)

  const isPending = isPendingCoinPrices || isPendingConversionRate

  const { transfers } = transaction

  const getTransactionIconByType = (transferType: TxnTransferType) => {
    switch (transferType) {
      case TxnTransferType.SEND:
        return (
          <ArrowRightIcon
            style={{
              transform: 'rotate(270deg)',
              width: '16px'
            }}
          />
        )
      case TxnTransferType.RECEIVE:
        return (
          <ArrowRightIcon
            style={{
              transform: 'rotate(90deg)',
              width: '16px'
            }}
          />
        )
      case TxnTransferType.UNKNOWN:
      default:
        return <TransactionIcon style={{ width: '14px' }} />
    }
  }

  const getTansactionLabelByType = (transferType: TxnTransferType) => {
    switch (transferType) {
      case TxnTransferType.SEND:
        return 'Sent'
      case TxnTransferType.RECEIVE:
        return 'Received'
      case TxnTransferType.UNKNOWN:
      default:
        return 'Transacted'
    }
  }

  const getTransferAmountLabel = (amount: string, symbol: string, transferType: TxnTransferType) => {
    let sign = ''
    if (transferType === TxnTransferType.SEND) {
      sign = '-'
    } else if (transferType === TxnTransferType.RECEIVE) {
      sign = '+'
    }

    let textColor = 'text50'
    if (transferType === TxnTransferType.SEND) {
      textColor = vars.colors.negative
    } else if (transferType === TxnTransferType.RECEIVE) {
      textColor = vars.colors.positive
    }

    return <Text fontWeight="bold" fontSize="normal" style={{ color: textColor }}>{`${sign}${amount} ${symbol}`}</Text>
  }

  interface GetTransfer {
    transfer: TxnTransfer
    isFirstItem: boolean
  }

  const getTransfer = ({ transfer, isFirstItem }: GetTransfer) => {
    const { amounts } = transfer
    const date = dayjs(transaction.timestamp).format('MMM DD, YYYY')
    return (
      <Box gap="2" width="full" flexDirection="column" justifyContent="space-between">
        <Box flexDirection="row" justifyContent="space-between">
          <Box color="text50" gap="1" flexDirection="row" justifyContent="center" alignItems="center">
            {getTransactionIconByType(transfer.transferType)}
            <Text fontWeight="medium" fontSize="normal" color="text100">
              {getTansactionLabelByType(transfer.transferType)}
            </Text>
            <NetworkImage chainId={transaction.chainId} size="xs" />
          </Box>
          {isFirstItem && (
            <Box>
              <Text fontWeight="medium" fontSize="normal" color="text50">
                {date}
              </Text>
            </Box>
          )}
        </Box>
        {amounts.map((amount, index) => {
          const nativeTokenInfo = getNativeTokenInfoByChainId(transaction.chainId, chains)
          const isNativeToken = compareAddress(transfer.contractAddress, ethers.constants.AddressZero)
          const isCollectible = transfer.contractInfo?.type === 'ERC721' || transfer.contractInfo?.type === 'ERC1155'
          let decimals
          const tokenId = transfer.tokenIds?.[index]
          if (isCollectible && tokenId) {
            decimals = transfer.tokenMetadata?.[tokenId]?.decimals || 0
          } else {
            decimals = isNativeToken ? nativeTokenInfo.decimals : transfer.contractInfo?.decimals
          }
          const amountValue = ethers.utils.formatUnits(amount, decimals)
          const symbol = isNativeToken ? nativeTokenInfo.symbol : transfer.contractInfo?.symbol || ''
          const tokenLogoUri = isNativeToken ? nativeTokenInfo.logoURI : transfer.contractInfo?.logoURI

          const fiatConversionRate = coinPrices.find((coinPrice: TokenPrice) =>
            compareAddress(coinPrice.token.contractAddress, transfer.contractAddress)
          )?.price?.value

          return (
            <Box key={index} flexDirection="row" justifyContent="space-between">
              <Box flexDirection="row" gap="2" justifyContent="center" alignItems="center">
                {tokenLogoUri && <Image src={tokenLogoUri} width="5" alt="token logo" />}
                {getTransferAmountLabel(formatDisplay(amountValue), symbol, transfer.transferType)}
              </Box>
              {isPending && <Skeleton style={{ width: '35px', height: '20px' }} />}
              {fiatConversionRate && (
                <Text fontWeight="medium" fontSize="normal" color="text50">
                  {`${fiatCurrency.sign}${(Number(amountValue) * fiatConversionRate * conversionRate).toFixed(2)}`}
                </Text>
              )}
            </Box>
          )
        })}
      </Box>
    )
  }

  return (
    <Box
      background="backgroundSecondary"
      borderRadius="md"
      padding="4"
      gap="2"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      userSelect="none"
      cursor="pointer"
      opacity={{ hover: '80' }}
      onClick={() => onClickTransaction()}
    >
      {transfers?.map((transfer, position) => {
        return (
          <Box key={`${transaction.txnHash}-${position}`} width="full">
            {getTransfer({
              transfer,
              isFirstItem: position === 0
            })}
          </Box>
        )
      })}
    </Box>
  )
}
