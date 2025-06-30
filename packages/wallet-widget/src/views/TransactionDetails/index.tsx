import type { Token } from '@0xsequence/api'
import { compareAddress, formatDisplay, getNativeTokenInfoByChainId, truncateAtIndex } from '@0xsequence/connect'
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
import { useGetCoinPrices, useGetCollectiblePrices, useGetExchangeRate } from '@0xsequence/hooks'
import { TxnTransferType, type Transaction, type TxnTransfer } from '@0xsequence/indexer'
import dayjs from 'dayjs'
import { formatUnits, zeroAddress } from 'viem'
import { useConfig } from 'wagmi'

import { CopyButton } from '../../components/CopyButton.js'
import { NetworkBadge } from '../../components/NetworkBadge.js'
import { useSettings } from '../../hooks/index.js'

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
      const contractAddress = transfer?.contractInfo?.address || zeroAddress
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

  const { data: coinPricesData, isLoading: isLoadingCoinPrices } = useGetCoinPrices(coins)

  const { data: collectiblePricesData, isLoading: isLoadingCollectiblePrices } = useGetCollectiblePrices(collectibles)

  const { data: conversionRate = 1, isLoading: isLoadingConversionRate } = useGetExchangeRate(fiatCurrency.symbol)

  const arePricesLoading =
    (coins.length > 0 && isLoadingCoinPrices) ||
    (collectibles.length > 0 && isLoadingCollectiblePrices) ||
    isLoadingConversionRate

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
    const recipientAddressFormatted = truncateAtIndex(recipientAddress, 10)
    const isNativeToken = compareAddress(transfer?.contractInfo?.address || '', zeroAddress)
    const isCollectible = transfer.contractType === 'ERC721' || transfer.contractType === 'ERC1155'
    const tokenId = transfer.tokenIds?.[0]
    const tokenLogoURI = isNativeToken
      ? nativeTokenInfo.logoURI
      : isCollectible
        ? transfer?.tokenMetadata?.[String(tokenId)]?.image
        : transfer?.contractInfo?.logoURI
    const contractLogoURI = transfer?.contractInfo?.logoURI
    const tokenSymbol = isNativeToken
      ? nativeTokenInfo.symbol
      : isCollectible
        ? transfer?.tokenMetadata?.[String(tokenId)]?.name || ''
        : transfer?.contractInfo?.symbol || ''
    const contractSymbol = transfer?.contractInfo?.name || ''

    const WalletContent = () => (
      <div
        className="flex flex-row justify-start items-center gap-2 h-12 rounded-xl bg-button-glass p-2"
        style={{ flexBasis: '100%' }}
      >
        <GradientAvatar size="sm" address={recipientAddress} />
        <div className="flex flex-row justify-between items-center w-full">
          <Text variant="xsmall" fontWeight="bold" color="primary">
            {recipientAddressFormatted}
          </Text>
          <div className="px-1">
            <CopyButton text={recipientAddress} />
          </div>
        </div>
      </div>
    )

    const TokenContent = ({
      balanceDisplayed,
      fiatValue,
      fiatPrice
    }: {
      balanceDisplayed: string
      fiatValue: string
      fiatPrice: number
    }) => {
      const senderAddress = transfer.from
      const senderAddressFormatted = truncateAtIndex(senderAddress, 10)

      return (
        <div
          className={`flex flex-col justify-center items-start gap-2 rounded-xl bg-button-glass p-2`}
          style={{ flexBasis: '100%' }}
        >
          <div className="flex flex-row items-center gap-2 w-full">
            <GradientAvatar size="sm" address={senderAddress} />
            <div className="flex flex-row justify-between items-center w-full">
              <Text variant="xsmall" fontWeight="bold" color="primary">
                {senderAddressFormatted}
              </Text>
              <div className="px-1">
                <CopyButton text={senderAddress} />
              </div>
            </div>
          </div>
          {isCollectible && (
            <div className="flex flex-row justify-start items-center gap-2">
              <TokenImage src={contractLogoURI} symbol={contractSymbol} size="sm" />
              <Text
                variant="xsmall"
                fontWeight="bold"
                color="primary"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {contractSymbol}
              </Text>
            </div>
          )}
          <div className="flex flex-row justify-start items-center gap-2">
            <TokenImage src={tokenLogoURI} symbol={tokenSymbol} size="sm" />
            <div className="flex gap-0.5 flex-col items-start justify-center">
              <Text
                variant="xsmall"
                fontWeight={isCollectible ? 'normal' : 'bold'}
                color="primary"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {`${balanceDisplayed} ${tokenSymbol}`}
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
        </div>
      )
    }

    return (
      <>
        {transfer.amounts?.map((amount, index) => {
          const isCollectible = transfer.contractType === 'ERC721' || transfer.contractType === 'ERC1155'
          const tokenId = transfer.tokenIds?.[index] || '0'
          const collectibleDecimals = transfer?.tokenMetadata?.[tokenId]?.decimals || 0
          const coinDecimals = isNativeToken ? nativeTokenInfo.decimals : transfer?.contractInfo?.decimals || 0
          const decimals = isCollectible ? collectibleDecimals : coinDecimals
          const formattedBalance = formatUnits(BigInt(amount), decimals)
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
                  compareAddress(coin.token.contractAddress, transfer.contractInfo?.address || zeroAddress) &&
                  coin.token.chainId === transaction.chainId
              )?.price?.value

          const fiatValue = (parseFloat(formattedBalance) * (conversionRate * (fiatPrice || 0))).toFixed(2)

          const isReceiveTransfer = transfer.transferType === TxnTransferType.RECEIVE

          return (
            <div className="flex w-full flex-row gap-2 justify-between items-center" key={index}>
              {isReceiveTransfer ? (
                <>
                  <WalletContent />
                  <ArrowRightIcon className="text-muted" style={{ width: '16px', transform: 'rotate(180deg)' }} />
                  <TokenContent balanceDisplayed={balanceDisplayed} fiatValue={fiatValue} fiatPrice={fiatPrice || 0} />
                </>
              ) : (
                <>
                  <TokenContent balanceDisplayed={balanceDisplayed} fiatValue={fiatValue} fiatPrice={fiatPrice || 0} />
                  <ArrowRightIcon className="text-muted" style={{ width: '16px' }} />
                  <WalletContent />
                </>
              )}
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div className="flex p-4 pt-3 flex-col items-center justify-center gap-10">
      <div className="flex flex-col justify-center items-center gap-1">
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
            Transfers
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
          <CopyButton className="mt-2" includeLabel text={transaction.txnHash} />
        </div>
      </div>
    </div>
  )
}
