import { useState, useEffect } from 'react'
import {
  ArrowDownIcon,
  Box,
  Card,
  NetworkImage,
  Spinner,
  Text,
  TokenImage,
  CheckmarkIcon,
  CloseIcon,
  truncateAddress
} from '@0xsequence/design-system'
import TimeAgo from 'timeago-react'
import { formatUnits, Hex, PublicClient } from 'viem'
import { usePublicClient } from 'wagmi'
import {
  CollectibleTileImage,
  useContractInfo,
  useTokenMetadata,
  formatDisplay,
  TRANSACTION_CONFIRMATIONS_DEFAULT
} from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'

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
    <Box position="fixed" style={{ top: '18px' }}>
      <Text color="white" variant="normal" fontWeight="bold" fontSize="large">
        {headerText}
      </Text>
    </Box>
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
    blockConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT
  } = transactionStatusSettings!
  const networkConfig = findSupportedNetwork(chainId)
  const blockExplorerUrl = `${networkConfig?.blockExplorer?.rootUrl}/tx/${txHash}`

  const [startTime] = useState(new Date())
  const [status, setStatus] = useState<TxStatus>('pending')
  const noItemsToDisplay = !items || !collectionAddress
  const { data: tokenMetadatas, isLoading: isLoadingTokenMetadatas } = useTokenMetadata(
    chainId,
    collectionAddress || '',
    items?.map(i => i.tokenId) || [],
    noItemsToDisplay
  )

  const publicClient = usePublicClient({
    chainId
  })

  const waitForTransaction = async (client: PublicClient, txnHash: string) => {
    try {
      await client.waitForTransactionReceipt({
        hash: txnHash as Hex,
        confirmations: blockConfirmations
      })
      setStatus('success')
    } catch (e) {
      console.error('An error occurred while waiting for transaction confirmation', e)
      setStatus('error')
    }
  }

  useEffect(() => {
    if (status === 'pending' && publicClient) {
      waitForTransaction(publicClient, txHash)
    }
  }, [status, publicClient, txHash])

  const { data: dataCollectionInfo, isLoading: isLoadingCollectionInfo } = useContractInfo(
    chainId,
    collectionAddress || '',
    noItemsToDisplay
  )
  const { data: dataCurrencyInfo, isLoading: isLoadingCurrencyInfo } = useContractInfo(
    chainId,
    currencyAddress || '',
    noItemsToDisplay
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
          <Box gap="2" justifyContent="center" alignItems="center">
            <Box width="6" height="6" borderRadius="circle" background="positive">
              <CheckmarkIcon color="white" position="relative" style={{ top: '3px', right: '-1px' }} />
            </Box>
            <Text variant="normal" color="text50">
              Transaction complete
            </Text>
          </Box>
        )
      case 'error':
        return (
          <Box gap="2" justifyContent="center" alignItems="center">
            <Box width="6" height="6" borderRadius="circle" background="negative">
              <CloseIcon color="white" position="relative" style={{ top: '2px', right: '-2px' }} />
            </Box>
            <Text variant="normal" color="text50">
              Transaction failed
            </Text>
          </Box>
        )
      case 'pending':
      default:
        return (
          <Box gap="2" justifyContent="center" alignItems="center">
            <Spinner />
            <Text variant="normal" color="text50">
              Processing transaction
            </Text>
          </Box>
        )
    }
  }

  const ItemsInfo = () => {
    return (
      <Box gap="3" flexDirection="column">
        {items?.map(item => {
          const collectibleQuantity = Number(formatUnits(BigInt(item.quantity), item?.decimals || 0))
          const tokenMetadata = tokenMetadatas?.find(tokenMetadata => tokenMetadata.tokenId === item.tokenId)

          const price = formatDisplay(formatUnits(BigInt(item.price), dataCurrencyInfo?.decimals || 0))

          return (
            <Box key={item.tokenId} flexDirection="row" alignItems="center" justifyContent="space-between">
              <Box flexDirection="row" gap="2">
                <Box
                  borderRadius="md"
                  style={{
                    height: '36px',
                    width: '36px'
                  }}
                >
                  <CollectibleTileImage imageUrl={tokenMetadata?.image} />
                </Box>
                <Box flexDirection="column" gap="0.5">
                  <Text variant="small" color="text80" fontWeight="medium">
                    {dataCollectionInfo?.name || null}
                  </Text>
                  <Text variant="small" color="text100" fontWeight="bold">
                    {`${tokenMetadata?.name || 'Collectible'} #${item.tokenId} ${collectibleQuantity > 1 ? `x${collectibleQuantity}` : ''}`}
                  </Text>
                </Box>
              </Box>
              <Box flexDirection="row" gap="1" alignItems="center" justifyContent="center">
                <TokenImage src={dataCurrencyInfo?.logoURI} size="xs" symbol={dataCurrencyInfo?.symbol} disableAnimation />
                <Text variant="normal" fontWeight="bold" color="white">{`${price} ${dataCurrencyInfo?.symbol}`}</Text>
              </Box>
            </Box>
          )
        })}
      </Box>
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
      <Box marginBottom="2" flexDirection="row" alignItems="center" justifyContent="space-between">
        <Box flexDirection="row" gap="1" alignItems="center" justifyContent="space-between">
          <ArrowDownIcon color="text80" size="xs" style={{ transform: 'rotate(180deg)', marginRight: '-4px' }} />
          <Text color="text80" variant="small" fontWeight="medium">
            {getStatusText()}
          </Text>
          <NetworkImage chainId={chainId} size="xs" />
        </Box>
        <Box>
          <Text color="text50" variant="small" fontWeight="medium">
            <TimeAgo datetime={startTime} />
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box width="full" paddingX="6" paddingBottom="6">
      <TransactionStatusHeader status={status} noItemsToDisplay={noItemsToDisplay} />
      <Box
        flexDirection="column"
        gap="6"
        alignItems="center"
        justifyContent="center"
        height="full"
        style={{ paddingTop: HEADER_HEIGHT }}
      >
        {isLoading ? (
          <Box width="full" justifyContent="center" alignItems="center">
            <Spinner size="md" />
          </Box>
        ) : (
          <>
            <Box width="full" justifyContent="flex-start">
              <Text variant="normal" color="text100">
                {getInformationText()}
              </Text>
            </Box>
            {!noItemsToDisplay && (
              <Card padding="4">
                <TxInfo />
                <ItemsInfo />
              </Card>
            )}
            <Box width="full" justifyContent="space-between" alignItems="center">
              <StatusIndicator />
              <Text
                href={blockExplorerUrl}
                textDecoration="none"
                variant="normal"
                cursor="pointer"
                as="a"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#8E7EFF' }}
              >
                {truncateAddress(txHash, 4, 4)}
              </Text>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
