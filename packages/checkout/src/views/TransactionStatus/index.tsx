import { useState } from 'react'
import { Box, Card, Spinner, Text } from '@0xsequence/design-system'
import { useAccount } from 'wagmi'
import { NetworkBadge, CollectibleTileImage, useContractInfo, useTokenMetadata, useCoinPrices } from '@0xsequence/kit'

import { HEADER_HEIGHT } from '../../constants'
import { useTransactionStatusModal } from '../../hooks'

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
  const { collectionAddress, chainId, items } = transactionStatusSettings!

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
              <Box>
                <Text color="text100">transaction status is here...</Text>
              </Box>
            </Card>
            <Box width="full">
              <Text color="text100">transaction status is here...</Text>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
