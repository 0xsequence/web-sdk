import { useState } from 'react'
import { Box, Card, Spinner, Text, CheckmarkIcon, CloseIcon, truncateAddress } from '@0xsequence/design-system'
import { useAccount } from 'wagmi'
import { NetworkBadge, CollectibleTileImage, useContractInfo, useTokenMetadata, useCoinPrices } from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'

import { HEADER_HEIGHT } from '../../constants'
import { useTransactionStatusModal } from '../../hooks'
import { network } from '0xsequence/dist/declarations/src/sequence'

export type TxStatus = 'pending' | 'success' | 'error'

interface TransactionStatusHeaderProps {
  status: TxStatus
}

export const TransactionStatusHeader = ({ status }: TransactionStatusHeaderProps) => {
  const getHeaderText = () => {
    switch (status) {
      case 'success':
        return 'Your purchase has processed'
      case 'error':
        return 'Your purchase has failed'
      case 'pending':
        return 'Your purchase is processing'
      default:
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
  const { address: userAddress } = useAccount()
  const { transactionStatusSettings } = useTransactionStatusModal()
  const { collectionAddress, chainId, items, txHash, currencyAddress } = transactionStatusSettings!
  const [transactionHash, setTransactionHash] = useState<string | undefined>(txHash)
  const networkConfig = findSupportedNetwork(chainId)
  const blockExplorerUrl = `${networkConfig?.blockExplorer?.rootUrl}/tx/${transactionHash}`

  const [status, setStatus] = useState<TxStatus>('pending')
  const { data: tokenMetadatas, isLoading: isLoadingTokenMetadatas } = useTokenMetadata(
    chainId,
    collectionAddress,
    items.map(i => i.tokenId)
  )

  const isLoading = isLoadingTokenMetadatas

  const getInformationText = () => {
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
      <Box gap="2" flexDirection="column">
        {items.map(item => (
          <Box key={item.tokenId} flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Text color="white">item!</Text>
            </Box>
            <Box>
              <Text color="white">price!</Text>
            </Box>
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <Box width="full" paddingX="6" paddingBottom="6">
      <TransactionStatusHeader status={status} />
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
            <Card padding="4">
              <ItemsInfo />
            </Card>
            <Box width="full" justifyContent="space-between" alignItems="center">
              <StatusIndicator />
              {transactionHash ? (
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
                  {truncateAddress(transactionHash || '', 4, 4)}
                </Text>
              ) : null}
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
