import { TokenPrice } from '@0xsequence/api'
import { compareAddress, formatDisplay, getNativeTokenInfoByChainId } from '@0xsequence/connect'
import { ArrowRightIcon, Text, Image, TransactionIcon, Skeleton, NetworkImage } from '@0xsequence/design-system'
import { Transaction, TxnTransfer, TxnTransferType } from '@0xsequence/indexer'
import { useGetCoinPrices, useGetExchangeRate } from '@0xsequence/react-hooks'
import dayjs from 'dayjs'
import React from 'react'
import { formatUnits, zeroAddress } from 'viem'
import { useConfig } from 'wagmi'

import { useSettings, useNavigation } from '../../hooks'

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

  const { data: coinPrices = [], isPending: isPendingCoinPrices } = useGetCoinPrices(
    tokenContractAddresses.map(contractAddress => ({
      contractAddress,
      chainId: transaction.chainId
    }))
  )

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useGetExchangeRate(fiatCurrency.symbol)

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

    let textColor: 'muted' | 'negative' | 'positive' = 'muted'
    if (transferType === TxnTransferType.SEND) {
      textColor = 'negative'
    } else if (transferType === TxnTransferType.RECEIVE) {
      textColor = 'positive'
    }

    return <Text variant="normal" fontWeight="bold" color={textColor}>{`${sign}${amount} ${symbol}`}</Text>
  }

  interface GetTransfer {
    transfer: TxnTransfer
    isFirstItem: boolean
  }

  const getTransfer = ({ transfer, isFirstItem }: GetTransfer) => {
    const { amounts } = transfer
    const date = dayjs(transaction.timestamp).format('MMM DD, YYYY')
    return (
      <div className="flex gap-2 w-full flex-col justify-between">
        <div className="flex flex-row justify-between">
          <div className="flex text-muted gap-1 flex-row justify-center items-center">
            {getTransactionIconByType(transfer.transferType)}
            <Text variant="normal" fontWeight="medium" color="primary">
              {getTansactionLabelByType(transfer.transferType)}
            </Text>
            <NetworkImage chainId={transaction.chainId} size="xs" />
          </div>
          {isFirstItem && (
            <div>
              <Text variant="normal" fontWeight="medium" color="muted">
                {date}
              </Text>
            </div>
          )}
        </div>
        {amounts.map((amount, index) => {
          const nativeTokenInfo = getNativeTokenInfoByChainId(transaction.chainId, chains)
          const isNativeToken = compareAddress(transfer.contractAddress, zeroAddress)
          const isCollectible = transfer.contractInfo?.type === 'ERC721' || transfer.contractInfo?.type === 'ERC1155'
          let decimals
          const tokenId = transfer.tokenIds?.[index]
          if (isCollectible && tokenId) {
            decimals = transfer.tokenMetadata?.[tokenId]?.decimals || 0
          } else {
            decimals = isNativeToken ? nativeTokenInfo.decimals : transfer.contractInfo?.decimals
          }
          const amountValue = formatUnits(BigInt(amount), decimals || 18)
          const symbol = isNativeToken ? nativeTokenInfo.symbol : transfer.contractInfo?.symbol || ''
          const tokenLogoUri = isNativeToken ? nativeTokenInfo.logoURI : transfer.contractInfo?.logoURI

          const fiatConversionRate = coinPrices.find((coinPrice: TokenPrice) =>
            compareAddress(coinPrice.token.contractAddress, transfer.contractAddress)
          )?.price?.value

          return (
            <div className="flex flex-row justify-between" key={index}>
              <div className="flex flex-row gap-2 justify-center items-center">
                {tokenLogoUri && <Image className="w-5" src={tokenLogoUri} alt="token logo" />}
                {getTransferAmountLabel(formatDisplay(amountValue), symbol, transfer.transferType)}
              </div>
              {isPending && <Skeleton style={{ width: '35px', height: '20px' }} />}
              {fiatConversionRate && (
                <Text variant="normal" fontWeight="medium" color="muted">
                  {`${fiatCurrency.sign}${(Number(amountValue) * fiatConversionRate * conversionRate).toFixed(2)}`}
                </Text>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="flex bg-background-secondary rounded-xl p-4 gap-2 items-center justify-center flex-col select-none cursor-pointer"
      onClick={() => onClickTransaction()}
    >
      {transfers?.map((transfer, position) => {
        return (
          <div className="w-full" key={`${transaction.txnHash}-${position}`}>
            {getTransfer({
              transfer,
              isFirstItem: position === 0
            })}
          </div>
        )
      })}
    </div>
  )
}
