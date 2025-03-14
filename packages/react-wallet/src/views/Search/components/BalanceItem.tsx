import { Text, ChevronRightIcon, TokenImage } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import { compareAddress, formatDisplay, getNativeTokenInfoByChainId } from '@0xsequence/react-connect'
import React from 'react'
import { formatUnits, zeroAddress } from 'viem'
import { useConfig } from 'wagmi'

import { useNavigation } from '../../../hooks'

interface BalanceItemProps {
  balance: TokenBalance
}

export const BalanceItem = ({ balance }: BalanceItemProps) => {
  const { chains } = useConfig()
  const { setNavigation } = useNavigation()
  const isNativeToken = compareAddress(balance.contractAddress, zeroAddress)
  const nativeTokenInfo = getNativeTokenInfoByChainId(balance.chainId, chains)
  const logoURI = isNativeToken ? nativeTokenInfo.logoURI : balance?.contractInfo?.logoURI
  const tokenName = isNativeToken ? nativeTokenInfo.name : balance?.contractInfo?.name || 'Unknown'
  const symbol = isNativeToken ? nativeTokenInfo.symbol : balance?.contractInfo?.symbol

  const getQuantity = () => {
    if (balance.contractType === 'ERC721' || balance.contractType === 'ERC1155') {
      return balance.uniqueCollectibles
    }
    const decimals = isNativeToken ? nativeTokenInfo.decimals : balance?.contractInfo?.decimals
    const bal = formatUnits(BigInt(balance.balance), decimals || 0)
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
    <div
      className="flex w-full flex-row justify-between items-center select-none cursor-pointer"
      key={balance.contractAddress}
      onClick={onClick}
    >
      <div className="flex gap-3 flex-row items-center justify-center min-w-0">
        <TokenImage src={logoURI} symbol={symbol} size="md" withNetwork={balance.chainId} />
        <Text className="overflow-hidden whitespace-nowrap" variant="normal" color="primary" fontWeight="bold" ellipsis>
          {tokenName}
        </Text>
      </div>
      <div className="flex flex-row items-center justify-center gap-1 max-w-1/2">
        <Text className="text-right whitespace-nowrap" variant="normal" color="muted" fontWeight="bold" ellipsis>
          {getQuantity()}
        </Text>
        <ChevronRightIcon className="text-muted" />
      </div>
    </div>
  )
}
