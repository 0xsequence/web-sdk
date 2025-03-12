import { Card, Image, Text, Skeleton, TokenImage, NetworkImage } from '@0xsequence/design-system'
import { formatDisplay } from '@0xsequence/react-connect'
import { useGetTokenMetadata, useGetContractInfo } from '@0xsequence/react-hooks'
import { ethers } from 'ethers'
interface OrderSummaryItem {
  contractAddress: string
  tokenId: string
  quantityRaw: string
  chainId: number
}

export const OrderSummaryItem = ({ contractAddress, tokenId, quantityRaw, chainId }: OrderSummaryItem) => {
  const { data: tokenMetadata, isPending: isPendingTokenMetadata } = useGetTokenMetadata({
    chainID: String(chainId),
    contractAddress,
    tokenIDs: [tokenId]
  })
  const { data: contractInfo, isPending: isPendingContractInfo } = useGetContractInfo({
    chainID: String(chainId),
    contractAddress
  })
  const isPending = isPendingTokenMetadata || isPendingContractInfo

  if (isPending) {
    return <OrderSummarySkeleton />
  }

  const { name = 'unknown', image, decimals = 0 } = tokenMetadata?.[0] ?? {}

  const { logoURI: collectionLogoURI, name: collectionName = 'Unknown Collection' } = contractInfo || {}

  const balanceFormatted = ethers.formatUnits(quantityRaw, decimals)

  return (
    <Card className="flex flex-row items-start justify-between">
      <div className="flex flex-row items-center justify-center gap-2">
        <div className="flex aspect-square h-full justify-center items-center" style={{ width: '80px' }}>
          <Image className="rounded-xl" src={image} style={{ maxWidth: '80px', height: '80px', objectFit: 'cover' }} />
        </div>
        <div className="flex flex-col items-start justify-center gap-2">
          <div className="flex gap-1 items-center">
            <TokenImage src={collectionLogoURI} size="xs" />
            <Text className="ml-1" variant="small" color="secondary" fontWeight="bold">
              {collectionName}
            </Text>
            <NetworkImage chainId={chainId} size="xs" />
          </div>
          <div
            className="flex flex-col items-start justify-center"
            style={{
              width: '180px'
            }}
          >
            <Text variant="normal" color="primary">
              {name}
            </Text>
            <Text variant="normal" color="muted">{`#${tokenId}`}</Text>
          </div>
        </div>
      </div>
      <div className="h-full">
        <Text variant="small" color="muted" fontWeight="bold">{`x${formatDisplay(balanceFormatted)}`}</Text>
      </div>
    </Card>
  )
}

export const OrderSummarySkeleton = () => {
  return (
    <Card className="flex flex-row items-start justify-between">
      <div className="flex flex-row items-center justify-center gap-2">
        <Skeleton style={{ width: '80px', height: '80px' }} />
        <div className="flex flex-col items-start justify-center gap-2">
          <Skeleton style={{ width: '100px', height: '14px' }} />
          <Skeleton style={{ width: '180px', height: '34px' }} />
        </div>
      </div>
      <Skeleton style={{ width: '14px', height: '14px' }} />
    </Card>
  )
}
