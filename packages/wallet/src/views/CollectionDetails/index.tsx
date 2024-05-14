import { Box, Image, Text, TokenImage, vars } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import { useCollectionBalance } from '@0xsequence/kit/hooks'
import { ethers } from 'ethers'
import React from 'react'
import { useAccount } from 'wagmi'

import { useNavigation } from '../../hooks'
import { NetworkBadge } from '../../shared/NetworkBadge'
import { formatDisplay } from '../../utils'

import { CollectionDetailsSkeleton } from './Skeleton'

interface CollectionDetailsProps {
  chainId: number
  contractAddress: string
}

export const CollectionDetails = ({ chainId, contractAddress }: CollectionDetailsProps) => {
  const { setNavigation } = useNavigation()
  const { address: accountAddress } = useAccount()
  const { data: collectionBalanceData, isPending: isPendingCollectionBalance } = useCollectionBalance({
    chainId,
    accountAddress: accountAddress || '',
    contractAddress
  })

  const contractInfo = collectionBalanceData?.[0]?.contractInfo
  const collectionLogoURI = contractInfo?.logoURI

  if (isPendingCollectionBalance) {
    return <CollectionDetailsSkeleton chainId={chainId} />
  }

  const onClickItem = (balance: TokenBalance) => {
    setNavigation &&
      setNavigation({
        location: 'collectible-details',
        params: {
          contractAddress: balance.contractAddress,
          chainId: balance.chainId,
          tokenId: balance.tokenID
        }
      })
  }

  return (
    <Box
      paddingX="4"
      paddingBottom="5"
      paddingTop="3"
      marginTop="8"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="10"
    >
      <Box flexDirection="column" gap="2" justifyContent="center" alignItems="center">
        <TokenImage src={collectionLogoURI} size="lg" />
        <Text fontWeight="bold" fontSize="large" color="text100">
          {contractInfo?.name || 'Unknown'}
        </Text>
        <NetworkBadge chainId={chainId} />
        <Text fontWeight="medium" fontSize="normal" color="text50">{`${
          collectionBalanceData?.length || 0
        } Unique Collectibles`}</Text>
      </Box>
      <Box width="full">
        <Text fontWeight="medium" fontSize="normal" color="text50">
          {`Owned (${collectionBalanceData?.length || 0})`}
        </Text>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `calc(50% - ${vars.space[1]}) calc(50% - ${vars.space[1]})`,
            gap: vars.space[2]
          }}
          width="full"
          marginTop="3"
        >
          {collectionBalanceData?.map((balance, index) => {
            const unformattedBalance = balance.balance
            const decimals = balance?.tokenMetadata?.decimals || 0
            const formattedBalance = formatDisplay(ethers.utils.formatUnits(unformattedBalance, decimals))

            return (
              <Box key={index} onClick={() => onClickItem(balance)} userSelect="none" cursor="pointer" opacity={{ hover: '80' }}>
                <Box
                  background="backgroundSecondary"
                  aspectRatio="1/1"
                  width="full"
                  borderRadius="md"
                  justifyContent="center"
                  alignItems="center"
                  marginBottom="2"
                >
                  <Image style={{ height: '100%' }} src={balance.tokenMetadata?.image} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="normal" color="text100">
                    {`${balance.tokenMetadata?.name}`}
                  </Text>
                </Box>
                <Box>
                  <Text marginTop="1" fontWeight="medium" fontSize="normal" color="text50">
                    {formattedBalance} Owned
                  </Text>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
