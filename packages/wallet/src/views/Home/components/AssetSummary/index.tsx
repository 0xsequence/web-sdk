import { Box, vars } from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import { useWalletSettings } from '@0xsequence/kit'
import React from 'react'
import { useAccount } from 'wagmi'

import { useBalancesAssetsSummary, useNavigation, useSettings } from '../../../../hooks'
import { sortBalancesByType } from '../../../../utils'

import { CoinTile } from './CoinTile'
import { CollectibleTile } from './CollectibleTile'
import { SkeletonTiles } from './SkeletonTiles'


export const AssetSummary = () => {
  const { address } = useAccount()
  const { setNavigation } = useNavigation()
  const { displayedAssets } = useWalletSettings()
  const { hideUnlistedTokens, hideCollectibles, selectedNetworks } = useSettings()

  const { data: balances = [], isPending: isPendingBalances } = useBalancesAssetsSummary({
    accountAddress: address || '',
    chainIds: selectedNetworks,
    displayAssets: displayedAssets,
    hideCollectibles,
    verifiedOnly: hideUnlistedTokens
  })

  if (isPendingBalances) {
    return <SkeletonTiles />
  }

  const { nativeTokens, erc20Tokens, collectibles } = sortBalancesByType(balances)

  const onClickItem = (balance: TokenBalance) => {
    if (balance.contractType === 'ERC1155' || balance.contractType === 'ERC721') {
      setNavigation &&
        setNavigation({
          location: 'collectible-details',
          params: {
            contractAddress: balance.contractAddress,
            chainId: balance.chainId,
            tokenId: balance.tokenID
          }
        })
    } else if (balance.contractType === 'ERC20') {
      setNavigation &&
        setNavigation({
          location: 'coin-details',
          params: {
            contractAddress: balance.contractAddress,
            chainId: balance.chainId
          }
        })
    } else {
      setNavigation &&
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
      style={{
        display: 'grid',
        gridTemplateColumns: `calc(50% - ${vars.space[1]}) calc(50% - ${vars.space[1]})`,
        gap: vars.space[2]
      }}
    >
      {nativeTokens.map((balance, index) => {
        return (
          <Box
            key={index}
            userSelect="none"
            cursor="pointer"
            opacity={{ hover: '80' }}
            aspectRatio="1/1"
            onClick={() => onClickItem(balance)}
          >
            <CoinTile balance={balance} />
          </Box>
        )
      })}
      {erc20Tokens.map((balance, index) => {
        return (
          <Box
            key={index}
            userSelect="none"
            cursor="pointer"
            opacity={{ hover: '80' }}
            aspectRatio="1/1"
            onClick={() => onClickItem(balance)}
          >
            <CoinTile balance={balance} />
          </Box>
        )
      })}
      {collectibles.map((balance, index) => {
        return (
          <Box
            key={index}
            userSelect="none"
            cursor="pointer"
            opacity={{ hover: '80' }}
            aspectRatio="1/1"
            onClick={() => onClickItem(balance)}
          >
            <CollectibleTile balance={balance} />
          </Box>
        )
      })}
    </Box>
  )
}
