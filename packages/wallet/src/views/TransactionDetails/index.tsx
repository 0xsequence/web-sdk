import { Token } from '@0xsequence/api'
import {
  ArrowRightIcon,
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
import { compareAddress, formatDisplay, getNativeTokenInfoByChainId } from '@0xsequence/kit'
import { useGetCoinPrices, useGetCollectiblePrices, useGetExchangeRate } from '@0xsequence/kit-hooks'
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import { useConfig } from 'wagmi'

import { useSettings } from '../../hooks'
import { CopyButton } from '../../shared/CopyButton'
import { NetworkBadge } from '../../shared/NetworkBadge'

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

  const { data: coinPricesData, isPending: isPendingCoinPrices } = useGetCoinPrices(coins)

  const { data: collectiblePricesData, isPending: isPendingCollectiblePrices } = useGetCollectiblePrices(collectibles)

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useGetExchangeRate(fiatCurrency.symbol)

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
            <div className="flex w-full flex-row gap-2 justify-between items-center" key={index}>
              <div
                className="flex flex-row justify-start items-center gap-2 h-12 rounded-xl bg-button-glass p-2"
                style={{ flexBasis: '100%' }}
              >
                <TokenImage src={logoURI} symbol={symbol} size="sm" />
                <div className="flex gap-0.5 flex-col items-start justify-center">
                  <Text variant="xsmall" fontWeight="bold" color="primary">
                    {`${balanceDisplayed} ${symbol}`}
                  </Text>
                  {arePricesLoading ? (
                    <Skeleton style={{ width: '44px', height: '12px' }} />
                  ) : (
                    <Text variant="xsmall" fontWeight="bold" color="muted">
                      {fiatPrice ? `${fiatCurrency.sign}${fiatValue}` : ''}
                    </Text>
                  )}
                </div>
              </div>
              <ArrowRightIcon className="text-muted" style={{ width: '16px' }} />
              <div
                className="flex flex-row justify-start items-center gap-2 h-12 rounded-xl bg-button-glass p-2"
                style={{ flexBasis: '100%' }}
              >
                <GradientAvatar size="sm" address={recipientAddress} />
                <Text variant="xsmall" fontWeight="bold" color="primary">
                  {recipientAddressFormatted}
                </Text>
              </div>
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div className="flex p-5 pt-3 flex-col items-center justify-center gap-10 mt-5">
      <div className="flex mt-6 flex-col justify-center items-center gap-1">
        <Text variant="normal" fontWeight="medium" color="primary">
          Transaction details
        </Text>
        <Text className="mb-1" variant="small" fontWeight="medium" color="muted">
          {date}
        </Text>
        <NetworkBadge chainId={transaction.chainId} />
      </div>
      <div className="flex flex-col items-center justify-center gap-4 w-full p-4 bg-background-secondary rounded-xl">
        <div className="flex w-full gap-1 flex-row items-center justify-start">
          <Text variant="normal" fontWeight="medium" color="muted">
            Transfer
          </Text>
          <NetworkImage chainId={transaction.chainId} size="xs" />
        </div>
        {transaction.transfers?.map((transfer, index) => (
          <div className="flex w-full flex-col justify-center items-center gap-4" key={`transfer-${index}`}>
            <Transfer transfer={transfer} />
          </div>
        ))}
      </div>
      <Button
        className="w-full rounded-xl"
        onClick={onClickBlockExplorer}
        rightIcon={LinkIcon}
        label={`View on ${nativeTokenInfo.blockExplorerName}`}
      />
      <div>
        <Divider className="w-full my-2" />
        <div className="flex w-full flex-col gap-2 justify-center items-start">
          <Text variant="normal" color="muted" fontWeight="medium">
            Status
          </Text>
          <Text variant="normal" fontWeight="medium" color="primary">
            Complete
          </Text>
        </div>

        <Divider className="w-full my-2" />
        <div className="flex w-full flex-col gap-2 justify-center items-start">
          <Text variant="normal" color="muted" fontWeight="medium">
            Transaction Hash
          </Text>
          <Text variant="normal" color="primary" fontWeight="medium" style={{ overflowWrap: 'anywhere' }}>
            {transaction.txnHash}
          </Text>
          <CopyButton className="mt-2" buttonVariant="with-label" text={transaction.txnHash} />
        </div>
      </div>
    </div>
  )
}
