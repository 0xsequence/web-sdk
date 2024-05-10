import { Box, Text, ChevronRightIcon, TokenImage, NetworkImage } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import { getNativeTokenInfoByChainId } from '@0xsequence/kit'
import { ethers } from 'ethers'
import React from 'react'
import { useConfig } from 'wagmi'

import { useNavigation } from '../../../hooks'
import { compareAddress, formatDisplay } from '../../../utils'

interface BalanceItemProps {
  balance: TokenBalance
}

export const BalanceItem = ({ balance }: BalanceItemProps) => {
  const { chains } = useConfig()
  const { setNavigation } = useNavigation()
  const isNativeToken = compareAddress(balance.contractAddress, ethers.constants.AddressZero)
  const nativeTokenInfo = getNativeTokenInfoByChainId(balance.chainId, chains)
  const logoURI = isNativeToken ? nativeTokenInfo.logoURI : balance?.contractInfo?.logoURI
  const tokenName = isNativeToken ? nativeTokenInfo.name : balance?.contractInfo?.name || 'Unknown'
  const symbol = isNativeToken ? nativeTokenInfo.symbol : balance?.contractInfo?.symbol

  const getQuantity = () => {
    if (balance.contractType === 'ERC721' || balance.contractType === 'ERC1155') {
      return balance.balance
    }
    const decimals = isNativeToken ? nativeTokenInfo.decimals : balance?.contractInfo?.decimals
    const bal = ethers.utils.formatUnits(balance.balance, decimals || 0)
    const displayBalance = formatDisplay(bal)
    const symbol = isNativeToken ? nativeTokenInfo.symbol : balance?.contractInfo?.symbol

    return `${displayBalance} ${symbol}`
  }

  const onClick = () => {
    const isCollection = balance.contractType === 'ERC721' || balance.contractType === 'ERC1155'
    if (isCollection) {
      setNavigation({
        location: 'collection-details',
        params: {
          contractAddress: balance.contractAddress,
          chainId: balance.chainId
        }
      })
    } else {
      setNavigation({
        location: 'coin-details',
        params: {
          contractAddress: balance.contractAddress,
          chainId: balance.chainId
        }
      })
    }
  }

  return (
    <Box
      key={balance.contractAddress}
      onClick={onClick}
      width="full"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      userSelect="none"
      cursor="pointer"
      opacity={{ hover: '80' }}
    >
      <Box gap="3" flexDirection="row" alignItems="center" justifyContent="center">
        <TokenImage src={logoURI} symbol={symbol} size="md" />
        <Box gap="1" flexDirection="row" alignItems="center" justifyContent="center">
          <Text
            color="text100"
            fontWeight="bold"
            fontSize="normal"
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              maxWidth: '250px',
              // @ts-ignore-next-line
              textWrap: 'nowrap'
            }}
          >
            {tokenName}
          </Text>
          <NetworkImage chainId={balance.chainId} size="xs" />
        </Box>
      </Box>
      <Box flexDirection="row" alignItems="center" justifyContent="center" gap="1">
        <Text color="text50" fontWeight="bold" fontSize="normal">
          {getQuantity()}
        </Text>
        <ChevronRightIcon color="text50" />
      </Box>
    </Box>
  )
}
