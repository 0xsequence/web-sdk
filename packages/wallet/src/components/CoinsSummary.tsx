import { Box, Button, Text, vars } from '@0xsequence/design-system'
import { ethers } from 'ethers'
import React from 'react'
import { useAccount, useNetwork } from 'wagmi'

import { CoinRow, CoinRowSkeleton } from './CoinRow'

import { getNativeTokenInfoByChainId } from '../utils'
import { useBalances, useNavigation } from '../hooks'

export const CoinsSummary = () => {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const chainId = chain?.id || 1
  const setNavigation = useNavigation()

  const { data: balances, isLoading } = useBalances({ accountAddress: address || '', chainId })

  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId)

  const nativeToken = balances?.find(b => b.contractAddress === ethers.constants.AddressZero)

  const erc20Tokens = balances?.filter(b => b.contractType === 'ERC20')

  const onClickViewAllCoins = () => {
    setNavigation && setNavigation({
      location: 'all-coins'
    })
  }

  if (isLoading) {
    return (
      <Box width="full" flexDirection="column" gap="2">
        <CoinRowSkeleton />
        <CoinRowSkeleton />
      </Box>
    )
  }

  const totalTokens = 1 + (erc20Tokens?.length || 0)

  return (
    <Box>
      <Box marginBottom="1">
        <Text variant="small" color="text50">{`Coins (${totalTokens})`}</Text>
      </Box>
      <Box width="full" flexDirection="column" gap="2">
        {nativeToken && (
          <CoinRow
            imageUrl={nativeTokenInfo.logoURI}
            decimals={nativeTokenInfo.decimals}
            name={nativeTokenInfo.name}
            symbol={nativeTokenInfo.symbol}
            balance={nativeToken.balance} 
          />
        )}
        {erc20Tokens && (
          erc20Tokens.slice(0, 1).map(token => (
            <CoinRow
              imageUrl={token.contractInfo?.logoURI || ''}
              decimals={token.contractInfo?.decimals || 18}
              name={token.contractInfo?.name || ''}
              symbol={token.contractInfo?.symbol || ''}
              balance={token.balance} 
            />
          ))
        )}
        <Button onClick={onClickViewAllCoins} variant="emphasis" label={`View All Coins`} />
      </Box>
    </Box>
  )
}