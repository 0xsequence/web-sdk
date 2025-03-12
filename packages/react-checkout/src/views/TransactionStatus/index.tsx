import {
  ArrowDownIcon,
  Card,
  NetworkImage,
  Spinner,
  Text,
  TokenImage,
  CheckmarkIcon,
  CloseIcon,
  truncateAddress
} from '@0xsequence/design-system'
import { TransactionStatus as TransactionStatusSequence } from '@0xsequence/indexer'
import { findSupportedNetwork } from '@0xsequence/network'
import {
  CollectibleTileImage,
  formatDisplay,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  waitForTransactionReceipt,
  useIndexerClient
} from '@0xsequence/react-connect'
import { useGetTokenMetadata, useGetContractInfo } from '@0xsequence/react-hooks'
import { useState, useEffect } from 'react'
import TimeAgo from 'timeago-react'
import { formatUnits, Hex, PublicClient } from 'viem'
import { usePublicClient } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { useTransactionStatusModal } from '../../hooks'

export type TxStatus = 'pending' | 'success' | 'error'

interface TransactionStatusHeaderProps {
  status: TxStatus
  noItemsToDisplay: boolean
}

export const TransactionStatusHeader = ({ status, noItemsToDisplay }: TransactionStatusHeaderProps) => {
  const getHeaderText = () => {
    if (noItemsToDisplay) {
      switch (status) {
        case 'success':
          return 'Your transaction has been processed'
        case 'error':
          return 'Your transaction has failed'
        case 'pending':
        default:
          return 'Your transaction is processing'
      }
    } else {
      switch (status) {
        case 'success':
          return 'Your purchase has been processed'
        case 'error':
          return 'Your purchase has failed'
        case 'pending':
        default:
          return 'Your purchase is processing'
      }
    }
  }

  const headerText = getHeaderText()

  return (
    <div className="fixed" style={{ top: '18px' }}>
      <Text className="text-xl" color="white" variant="normal" fontWeight="bold">
        {headerText}
      </Text>
    </div>
  )
}

export const TransactionStatus = () => {
  const { transactionStatusSettings } = useTransactionStatusModal()
  const {
    collectionAddress,
    chainId,
    items,
    txHash,
    currencyAddress,
    blockConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT,
    onSuccess,
    onError,
    onClose = () => {}
  } = transactionStatusSettings!
  const networkConfig = findSupportedNetwork(chainId)
  const blockExplorerUrl = `${networkConfig?.blockExplorer?.rootUrl}tx/${txHash}`

  const [startTime] = useState(new Date())
  const [status, setStatus] = useState<TxStatus>('pending')
  const noItemsToDisplay = !items || !collectionAddress
  const { data: tokenMetadatas, isLoading: isLoadingTokenMetadatas } = useGetTokenMetadata(
    {
      chainID: String(chainId),
      contractAddress: collectionAddress || '',
      tokenIDs: items?.map(i => i.tokenId) || []
    },
    {
      disabled: noItemsToDisplay
    }
  )

  const publicClient = usePublicClient({
    chainId
  })

  const indexerClient = useIndexerClient(chainId)

  const waitForTransaction = async (publicClient: PublicClient, txnHash: string) => {
    try {
      const { txnStatus } = await waitForTransactionReceipt({
        indexerClient,
        txnHash: txnHash as Hex,
        publicClient,
        confirmations: blockConfirmations
      })

      if (txnStatus === TransactionStatusSequence.FAILED) {
        throw new Error('Transaction failed')
      }

      setStatus('success')
      onSuccess?.(txnHash)
    } catch (e) {
      console.error('An error occurred while waiting for transaction confirmation', e)
      setStatus('error')
      onError?.(e as Error)
    }
  }

  useEffect(() => {
    if (status === 'pending' && publicClient) {
      waitForTransaction(publicClient, txHash)
    }
  }, [status, publicClient, txHash])

  useEffect(() => {
    return () => {
      onClose()
    }
  }, [])

  const { data: dataCollectionInfo, isLoading: isLoadingCollectionInfo } = useGetContractInfo(
    {
      chainID: String(chainId),
      contractAddress: collectionAddress || ''
    },
    {
      disabled: noItemsToDisplay
    }
  )
  const { data: dataCurrencyInfo, isLoading: isLoadingCurrencyInfo } = useGetContractInfo(
    {
      chainID: String(chainId),
      contractAddress: currencyAddress || ''
    },
    {
      disabled: noItemsToDisplay
    }
  )

  const isLoading = isLoadingTokenMetadatas || isLoadingCollectionInfo || isLoadingCurrencyInfo

  const getInformationText = () => {
    if (noItemsToDisplay) {
      switch (status) {
        case 'success':
          return 'The transaction has been confirmed on the blockchain!'
        case 'error':
          return 'An error occurred while processing the transaction.'
        case 'pending':
        default:
          return `The transaction will be confirmed on the blockchain shortly.`
      }
    } else {
      const tokenNames =
        tokenMetadatas
          ?.map(metadata => {
            return `${metadata.name} #${metadata.tokenId}`
          })
          .join(', ') || ''

      switch (status) {
        case 'success':
          return `You just purchased ${tokenNames}. It’s been confirmed on the blockchain!`
        case 'error':
          return `You just purchased ${tokenNames}, but an error occurred.`
        case 'pending':
        default:
          return `You just purchased ${tokenNames}. It should be confirmed on the blockchain shortly.`
      }
    }
  }

  const StatusIndicator = () => {
    switch (status) {
      case 'success':
        return (
          <div className="flex gap-2 justify-center items-center">
            <div className="w-6 h-6 rounded-full bg-positive">
              <CheckmarkIcon className="text-white relative" style={{ top: '3px', right: '-1px' }} />
            </div>
            <Text variant="normal" color="muted">
              Transaction complete
            </Text>
          </div>
        )
      case 'error':
        return (
          <div className="flex gap-2 justify-center items-center">
            <div className="w-6 h-6 rounded-full bg-negative">
              <CloseIcon className="text-white relative" style={{ top: '2px', right: '-2px' }} />
            </div>
            <Text variant="normal" color="muted">
              Transaction failed
            </Text>
          </div>
        )
      case 'pending':
      default:
        return (
          <div className="flex gap-2 justify-center items-center">
            <Spinner />
            <Text variant="normal" color="muted">
              Processing transaction
            </Text>
          </div>
        )
    }
  }

  const ItemsInfo = () => {
    return (
      <div className="flex gap-3 flex-col">
        {items?.map(item => {
          const collectibleQuantity = Number(formatUnits(BigInt(item.quantity), item?.decimals || 0))
          const tokenMetadata = tokenMetadatas?.find(tokenMetadata => tokenMetadata.tokenId === item.tokenId)

          const price = formatDisplay(formatUnits(BigInt(item.price), dataCurrencyInfo?.decimals || 0))

          return (
            <div className="flex flex-row items-center justify-between" key={item.tokenId}>
              <div className="flex flex-row gap-2">
                <div
                  className="rounded-xl"
                  style={{
                    height: '36px',
                    width: '36px'
                  }}
                >
                  <CollectibleTileImage imageUrl={tokenMetadata?.image} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Text variant="small" color="secondary" fontWeight="medium">
                    {dataCollectionInfo?.name || null}
                  </Text>
                  <Text variant="small" color="primary" fontWeight="bold">
                    {`${tokenMetadata?.name || 'Collectible'} #${item.tokenId} ${collectibleQuantity > 1 ? `x${collectibleQuantity}` : ''}`}
                  </Text>
                </div>
              </div>
              <div className="flex flex-row gap-1 items-center justify-center">
                <TokenImage src={dataCurrencyInfo?.logoURI} size="xs" symbol={dataCurrencyInfo?.symbol} disableAnimation />
                <Text variant="normal" fontWeight="bold" color="white">{`${price} ${dataCurrencyInfo?.symbol}`}</Text>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const TxInfo = () => {
    const getStatusText = () => {
      switch (status) {
        case 'success':
          return 'Sent!'
        case 'error':
          return 'Not sent'
        case 'pending':
        default:
          return 'Sending...'
      }
    }

    return (
      <div className="flex mb-2 flex-row items-center justify-between">
        <div className="flex flex-row gap-1 items-center justify-between">
          <ArrowDownIcon className="text-secondary" size="xs" style={{ transform: 'rotate(180deg)', marginRight: '-4px' }} />
          <Text color="secondary" variant="small" fontWeight="medium">
            {getStatusText()}
          </Text>
          <NetworkImage chainId={chainId} size="xs" />
        </div>
        <div>
          <Text color="muted" variant="small" fontWeight="medium">
            <TimeAgo datetime={startTime} />
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-6 pb-6">
      <TransactionStatusHeader status={status} noItemsToDisplay={noItemsToDisplay} />
      <div className="flex flex-col gap-6 items-center justify-center h-full" style={{ paddingTop: HEADER_HEIGHT }}>
        {isLoading ? (
          <div className="flex w-full justify-center items-center">
            <Spinner size="md" />
          </div>
        ) : (
          <>
            <div className="flex w-full justify-start">
              <Text variant="normal" color="primary">
                {getInformationText()}
              </Text>
            </div>
            {!noItemsToDisplay && (
              <Card className="p-4">
                <TxInfo />
                <ItemsInfo />
              </Card>
            )}
            <div className="flex w-full justify-between items-center">
              <StatusIndicator />
              <Text className="no-underline cursor-pointer" variant="normal" style={{ color: '#8E7EFF' }} asChild>
                <a href={blockExplorerUrl} target="_blank" rel="noreferrer">
                  {truncateAddress(txHash, 4, 4)}
                </a>
              </Text>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
