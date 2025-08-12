import { commons } from '@0xsequence/core'
import { Card, Collapsible, GradientAvatar, Skeleton, Text, TokenImage } from '@0xsequence/design-system'
import { useAPIClient, useGetSingleTokenBalance, useGetTokenMetadata } from '@0xsequence/hooks'
import { ContractType } from '@0xsequence/indexer'
import { useEffect, useState } from 'react'
import { formatUnits, zeroAddress } from 'viem'
import { useConfig } from 'wagmi'

import { capitalize, compareAddress, truncateAtMiddle } from '../../utils/helpers.js'
import { getNativeTokenInfoByChainId } from '../../utils/tokens.js'
import { decodeTransactions, DecodingType, type AwardItemProps, type TransferProps } from '../../utils/txnDecoding.js'
import { CollectibleTileImage } from '../CollectibleTileImage/index.js'

interface TxnDetailsProps {
  address: string
  txs: commons.transaction.Transaction[]
  chainId: number
}

export const TxnDetailsSkeleton = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex justify-center items-center gap-2">
        <Skeleton className="rounded-full" style={{ width: 30, height: 30 }} />
        <div className="flex flex-col gap-2 items-start">
          <Skeleton style={{ width: 100, height: 14 }} />
          <Skeleton style={{ width: 75, height: 14 }} />
        </div>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <Skeleton style={{ width: 100, height: 14 }} />
        <Skeleton style={{ width: 50, height: 12 }} />
      </div>
    </div>
  )
}

export const TxnDetails = ({ address, txs, chainId }: TxnDetailsProps) => {
  const apiClient = useAPIClient()
  // const { fiatCurrency } = useSettings()

  const [decodingType, setDecodingType] = useState<DecodingType | undefined>(undefined)
  const [transferProps, setTransferProps] = useState<TransferProps[]>([])
  const [awardItemProps, setAwardItemProps] = useState<AwardItemProps[]>([])

  const getTxnProps = async () => {
    // @ts-ignore
    const decodedTxnDatas = await decodeTransactions(apiClient, address, txs)
    const type = decodedTxnDatas[0]?.type

    setDecodingType(type)

    if (type === DecodingType.TRANSFER) {
      setTransferProps(decodedTxnDatas as TransferProps[])
    }

    if (type === DecodingType.AWARD_ITEM) {
      setAwardItemProps(decodedTxnDatas as AwardItemProps[])
    }
  }

  useEffect(() => {
    getTxnProps()
  }, [])

  let txnContent = <></>

  if (transferProps[0]) {
    txnContent = <TransferItemInfo address={address} transferProps={transferProps[0]} chainId={chainId} />
  }
  if (awardItemProps[0]) {
    txnContent = <AwardItemInfo awardItemProps={awardItemProps[0]} />
  }

  return (
    <div className="flex flex-col w-full">
      {txnContent}

      <Collapsible className="mt-4" label="Transaction data" defaultOpen={!decodingType || decodingType === DecodingType.UNKNOWN}>
        <Card className="overflow-x-scroll my-3">
          <Text className="mb-4" variant="code">
            {JSON.stringify(txs, null, 2)}
          </Text>
        </Card>
      </Collapsible>
    </div>
  )
}

interface TransferItemInfoProps {
  address: string
  transferProps: TransferProps
  chainId: number
}

const TransferItemInfo = ({ address, transferProps, chainId }: TransferItemInfoProps) => {
  const { chains } = useConfig()
  const contractAddress = transferProps.contractAddress
  const toAddress: string | undefined = transferProps.to
  const isNativeCoin = contractAddress ? compareAddress(contractAddress, zeroAddress) : true
  const is1155 = transferProps.contractType === ContractType.ERC1155
  const isNFT = transferProps.contractType === ContractType.ERC1155 || transferProps.contractType === ContractType.ERC721
  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, chains)

  const { data: tokenBalance } = useGetSingleTokenBalance({
    chainId,
    contractAddress,
    accountAddress: address
  })

  const { data: tokenMetadata } = useGetTokenMetadata({
    chainID: String(chainId),
    contractAddress,
    tokenIDs: transferProps.tokenIds ?? []
  })

  const decimals = isNativeCoin ? nativeTokenInfo.decimals : tokenBalance?.contractInfo?.decimals || 18

  const imageUrl = isNativeCoin
    ? nativeTokenInfo.logoURI
    : isNFT
      ? tokenMetadata?.[0]?.image
      : tokenBalance?.contractInfo?.logoURI
  const name = isNativeCoin ? nativeTokenInfo.name : isNFT ? tokenMetadata?.[0]?.name : tokenBalance?.contractInfo?.name || ''
  const symbol = isNativeCoin ? nativeTokenInfo.symbol : isNFT ? '' : tokenBalance?.contractInfo?.symbol || ''

  const amountSending = transferProps.amounts[0] ?? transferProps.value

  const showSquareImage = isNFT
  return (
    <Card>
      <div className="mb-2">
        <Text variant="medium" color="primary">
          {capitalize(transferProps.type ?? '')}
        </Text>
      </div>
      <div className="flex items-end justify-between mb-2">
        <div className="flex justify-between items-center gap-2">
          {showSquareImage ? (
            <div style={{ width: '40px' }}>
              <CollectibleTileImage imageUrl={imageUrl} />
            </div>
          ) : (
            <TokenImage src={imageUrl} symbol={symbol} size="md" />
          )}
          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-1">
              <Text variant="medium" color="primary">
                {name}
              </Text>
            </div>

            <Text color="muted" variant="normal">
              {`${formatUnits(BigInt(amountSending), is1155 ? tokenMetadata?.[0]?.decimals || 0 : isNFT ? 0 : decimals)} ${symbol} `}
            </Text>
          </div>
        </div>
      </div>
      {toAddress !== undefined && (
        <div>
          <Text variant="normal" color="muted">
            To
          </Text>
          <div
            className="flex mt-2 rounded-xl bg-background-secondary w-full flex-row justify-between items-center p-4"
            style={{ height: '52px' }}
          >
            <div className="flex flex-row justify-center items-center gap-2">
              <GradientAvatar size="sm" address={toAddress} />
              <Text color="primary">{`0x${truncateAtMiddle(toAddress.substring(2), 12)}`}</Text>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

interface AwardItemInfoProps {
  awardItemProps: AwardItemProps
}

// This is used only for demo purposes
const AwardItemInfo = ({ awardItemProps }: AwardItemInfoProps) => {
  return (
    <Card>
      <div className="mb-2">
        <Text variant="medium" color="primary">
          Mint
        </Text>
      </div>
      <div className="flex items-end justify-between mb-2">
        <div className="flex justify-between items-center gap-2">
          <div style={{ width: '40px' }}>
            <CollectibleTileImage imageUrl="https://dev-metadata.sequence.app/projects/277/collections/62/tokens/0/image.jpeg" />
          </div>

          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-1">
              <Text variant="medium" color="primary">
                Waas Demo NFT
              </Text>
            </div>

            <Text color="muted" variant="normal">
              {awardItemProps.amount}
            </Text>
          </div>
        </div>
      </div>
      {awardItemProps.to !== undefined && (
        <div>
          <Text variant="normal" color="muted">
            To
          </Text>
          <div
            className="flex mt-2 rounded-xl bg-background-secondary w-full flex-row justify-between items-center p-4"
            style={{ height: '52px' }}
          >
            <div className="flex flex-row justify-center items-center gap-2">
              <GradientAvatar size="sm" address={awardItemProps.to} />
              <Text color="primary">{`0x${truncateAtMiddle(awardItemProps.to.substring(2), 12)}`}</Text>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
