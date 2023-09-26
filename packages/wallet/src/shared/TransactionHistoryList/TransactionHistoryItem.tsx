import React from 'react'
import { ethers } from 'ethers'
import { Transaction, TxnTransfer, TxnTransferType } from '@0xsequence/indexer'
import { getNativeTokenInfoByChainId } from '@0xsequence/kit'
import {
  ArrowRightIcon,
  Box,
  Text,
  Image,
  SendIcon,
  ReceiveIcon,
  TransactionIcon,
  vars
} from '@0xsequence/design-system'
import dayjs from 'dayjs'
import { useNetwork } from 'wagmi'

import * as sharedStyles from '../../shared/styles.css'
import { Skeleton } from '../../shared/Skeleton'
import {
  useCoinPrices,
  useSettings,
  useNavigation,
  useConversionRate
} from '../../hooks'
import {
  formatDisplay,
  compareAddress,
} from '../../utils'

interface TransactionHistoryItemProps {
  transaction: Transaction
}


export const TransactionHistoryItem = ({
  transaction
}: TransactionHistoryItemProps) => {
  const { chains = [] } = useNetwork()
  const { fiatCurrency } = useSettings()
  const { setNavigation } = useNavigation()

  const onClickTransaction = () => {
    setNavigation({
      location: 'transaction-details',
      params: {
        transaction
      }
    });
  }

  let tokenContractAddresses: string[] = []
    
  transaction.transfers?.forEach((transfer) => {
    const tokenContractAddress = transfer.contractAddress
    if (!tokenContractAddresses.includes(tokenContractAddress)) {
      tokenContractAddresses.push(tokenContractAddress)
    }
  })

  const {
    data: coinPrices = [],
    isLoading: isLoadingCoinPrices
  } = useCoinPrices({
    tokens: tokenContractAddresses.map((contractAddress) => ({
      contractAddress,
      chainId: transaction.chainId
    }))
  })

  const { data: conversionRate = 1, isLoading: isLoadingConversionRate } = useConversionRate({
    toCurrency: fiatCurrency.symbol
  })
  
  const isLoading = isLoadingCoinPrices || isLoadingConversionRate

  const { transfers } = transaction

  const nativeTokenInfo = getNativeTokenInfoByChainId(transaction.chainId, chains)

  const getTransactionIconByType = (transferType: TxnTransferType) => {
    switch(transferType) {
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
    switch(transferType) {
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
    } else if  (transferType === TxnTransferType.RECEIVE) {
      textColor = vars.colors.positive
    }

    return (
      <Text fontWeight="bold" fontSize="normal" style={{ color: textColor }}>{`${sign}${amount} ${symbol}`}</Text>
    )
  }

  interface GetTransfer {
    transfer: TxnTransfer
    isFirstItem: boolean
  }

  const getTransfer = ({
    transfer,
    isFirstItem
  }: GetTransfer)  => {
    const { amounts } = transfer
    const date = dayjs(transaction.timestamp).format('MMM DD, YYYY')
    return (
      <Box gap="2" width="full" flexDirection="column" justifyContent="space-between">
        <Box flexDirection="row" justifyContent="space-between">
          <Box color="text50" gap="1" flexDirection="row" justifyContent="center" alignItems="center">
            {getTransactionIconByType(transfer.transferType)}
            <Text fontWeight="medium" fontSize="normal">{getTansactionLabelByType(transfer.transferType)}</Text>
            <Image src={nativeTokenInfo.logoURI} width="3" />
          </Box>
          {isFirstItem && (
            <Box>
              <Text fontWeight="medium" fontSize="normal" color="text50">{date}</Text>
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

          const fiatConversionRate = coinPrices.find((coinPrice) => compareAddress(coinPrice.token.contractAddress, transfer.contractAddress))?.price?.value

          return (
            <Box key={index} flexDirection="row" justifyContent="space-between">
              <Box flexDirection="row" gap="2" justifyContent="center" alignItems="center">
                {tokenLogoUri && (
                  <Image src={tokenLogoUri} width="5" alt="token logo" />
                )}
                {getTransferAmountLabel(formatDisplay(amountValue), symbol, transfer.transferType)}
              </Box>
              {isLoading && (
                <Skeleton width="35px" height="20px" />
              )}
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
      className={sharedStyles.clickable}
      onClick={() => onClickTransaction()}
    >
      {transfers?.map((transfer, position) => {
        return (
          <Box  key={`${transaction.txnHash}-${position}`} width="full">
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