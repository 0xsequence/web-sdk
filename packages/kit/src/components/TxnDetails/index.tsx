import { commons } from '@0xsequence/core'
import { Box, Card, GradientAvatar, Skeleton, Text, TokenImage } from '@0xsequence/design-system'
import { ContractType } from '@0xsequence/indexer'
import { useTokenMetadata, useBalances } from '@0xsequence/kit'
import { ethers } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useConfig } from 'wagmi'

import { useAPIClient } from '../../hooks'
import { capitalize, compareAddress, getNativeTokenInfoByChainId } from '../../utils'
import { DecodingType, TransferProps, AwardItemProps, decodeTransactions } from '../../utils/txnDecoding'
import { CollectibleTileImage } from '../KitProvider/CollectibleTileImage'

interface TxnDetailsProps {
  address: string
  txs: commons.transaction.Transaction[]
  chainId: number
}

export const TxnDetailsSkeleton = () => {
  return (
    <Box alignItems="center" justifyContent="space-between">
      <Box justifyContent="center" alignItems="center" gap="2">
        <Skeleton style={{ width: 30, height: 30 }} borderRadius="circle" />
        <Box flexDirection="column" gap="2" alignItems="flex-start">
          <Skeleton style={{ width: 100, height: 14 }} />
          <Skeleton style={{ width: 75, height: 14 }} />
        </Box>
      </Box>
      <Box flexDirection="column" gap="2" alignItems="flex-end">
        <Skeleton style={{ width: 100, height: 14 }} />
        <Skeleton style={{ width: 50, height: 12 }} />
      </Box>
    </Box>
  )
}

// @ts-ignore-next-line
export const TxnDetails = ({ address, txs, chainId }: TxnDetailsProps) => {
  const apiClient = useAPIClient()
  // const { fiatCurrency } = useSettings()

  const [decodingType, setDecodingType] = useState<DecodingType | undefined>(undefined)
  const [transferProps, setTransferProps] = useState<TransferProps[]>([])
  const [awardItemProps, setAwardItemProps] = useState<AwardItemProps[]>([])

  const getTxnProps = async () => {
    const decodedTxnDatas = await decodeTransactions(apiClient, address, txs)

    setDecodingType(decodedTxnDatas[0].type)

    if (decodedTxnDatas[0].type === 'transfer') {
      setTransferProps(decodedTxnDatas as TransferProps[])
    }

    if (decodedTxnDatas[0].type === 'awardItem') {
      setAwardItemProps(decodedTxnDatas as AwardItemProps[])
    }
  }

  useEffect(() => {
    getTxnProps()
  }, [])

  if (!decodingType) {
    return <TxnDetailsSkeleton />
  }

  if (decodingType === DecodingType.UNKNOWN) {
    return <></>
  }

  if (transferProps.length >= 1) {
    return <TransferItemInfo address={address} transferProps={transferProps} chainId={chainId} />
  }
  if (awardItemProps.length >= 1) {
    return <AwardItemInfo awardItemProps={awardItemProps[0]} />
  }
}

interface TransferItemInfoProps {
  address: string
  transferProps: TransferProps[]
  chainId: number
}

const TransferItemInfo = ({ address, transferProps, chainId }: TransferItemInfoProps) => {
  const { chains } = useConfig()
  const contractAddress: string | undefined = transferProps[0]?.contractAddress
  const toAddress: string | undefined = transferProps[0]?.to
  const isNativeCoin = contractAddress ? compareAddress(contractAddress, ethers.constants.AddressZero) : true
  const is1155 = transferProps[0]?.contractType === ContractType.ERC1155
  const isNFT = transferProps[0]?.contractType === ContractType.ERC1155 || transferProps[0]?.contractType === ContractType.ERC721
  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, chains)

  const { data: balances = [] } = useBalances({
    chainIds: [chainId],
    accountAddress: address,
    contractAddress
  })

  const { data: tokenMetadata } = useTokenMetadata(chainId, contractAddress, transferProps[0]?.tokenIds ?? [])

  const tokenBalance = contractAddress ? balances.find(b => compareAddress(b.contractAddress, contractAddress)) : undefined
  const decimals = isNativeCoin ? nativeTokenInfo.decimals : tokenBalance?.contractInfo?.decimals || 18

  const imageUrl = isNativeCoin
    ? nativeTokenInfo.logoURI
    : isNFT
      ? tokenMetadata?.[0]?.image
      : tokenBalance?.contractInfo?.logoURI
  const name = isNativeCoin ? nativeTokenInfo.name : isNFT ? tokenMetadata?.[0]?.name : tokenBalance?.contractInfo?.name || ''
  const symbol = isNativeCoin ? nativeTokenInfo.symbol : isNFT ? '' : tokenBalance?.contractInfo?.symbol || ''

  const amountSending = transferProps[0]?.amounts?.[0] ?? transferProps[0]?.value

  const showSquareImage = isNFT
  return (
    <Card>
      <Box marginBottom="2">
        <Text variant="medium" color="text100">
          {capitalize(transferProps[0]?.type ?? '')}
        </Text>
      </Box>

      <Box alignItems="flex-end" justifyContent="space-between" marginBottom="2">
        <Box justifyContent="space-between" alignItems="center" gap="2">
          {showSquareImage ? (
            <Box style={{ width: '40px' }}>
              <CollectibleTileImage imageUrl={imageUrl} />
            </Box>
          ) : (
            <TokenImage src={imageUrl} symbol={symbol} size="md" />
          )}
          <Box flexDirection="column" alignItems="flex-start">
            <Box flexDirection="row" alignItems="center" gap="1">
              <Text variant="medium" color="text100">
                {name}
              </Text>
            </Box>

            <Text color="text50" variant="normal">
              {' '}
              {`${ethers.utils.formatUnits(
                amountSending,
                is1155 ? tokenMetadata?.[0]?.decimals : isNFT ? 0 : decimals
              )} ${symbol} `}
            </Text>
          </Box>
        </Box>
      </Box>

      {toAddress !== undefined && (
        <Box>
          <Text fontSize="normal" color="text50">
            To
          </Text>
          <Box
            marginTop="2"
            borderRadius="md"
            background="backgroundSecondary"
            width="full"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            padding="4"
            style={{ height: '52px' }}
          >
            <Box flexDirection="row" justifyContent="center" alignItems="center" gap="2">
              <GradientAvatar address={toAddress} style={{ width: '20px' }} />
              <Text color="text100">{`0x${truncateAtMiddle(toAddress.substring(2), 12)}`}</Text>
            </Box>
          </Box>
        </Box>
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
      <Box marginBottom="2">
        <Text variant="medium" color="text100">
          Mint
        </Text>
      </Box>

      <Box alignItems="flex-end" justifyContent="space-between" marginBottom="2">
        <Box justifyContent="space-between" alignItems="center" gap="2">
          <Box style={{ width: '40px' }}>
            <CollectibleTileImage imageUrl="https://dev-metadata.sequence.app/projects/277/collections/62/tokens/0/image.jpeg" />
          </Box>

          <Box flexDirection="column" alignItems="flex-start">
            <Box flexDirection="row" alignItems="center" gap="1">
              <Text variant="medium" color="text100">
                Waas Demo NFT
              </Text>
            </Box>

            <Text color="text50" variant="normal">
              {awardItemProps.amount}
            </Text>
          </Box>
        </Box>
      </Box>

      {awardItemProps.to !== undefined && (
        <Box>
          <Text fontSize="normal" color="text50">
            To
          </Text>
          <Box
            marginTop="2"
            borderRadius="md"
            background="backgroundSecondary"
            width="full"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            padding="4"
            style={{ height: '52px' }}
          >
            <Box flexDirection="row" justifyContent="center" alignItems="center" gap="2">
              <GradientAvatar address={awardItemProps.to} style={{ width: '20px' }} />
              <Text color="text100">{`0x${truncateAtMiddle(awardItemProps.to.substring(2), 12)}`}</Text>
            </Box>
          </Box>
        </Box>
      )}
    </Card>
  )
}

const truncateAtMiddle = (text: string, truncateAt: number) => {
  let finalText = text

  if (text.length >= truncateAt) {
    finalText = text.slice(0, truncateAt / 2) + '...' + text.slice(text.length - truncateAt / 2, text.length)
  }

  return finalText
}
