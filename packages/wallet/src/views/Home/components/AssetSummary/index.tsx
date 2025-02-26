import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

import { useNavigation, useSettings } from '../../../../hooks'
import { CoinTile } from './CoinTile'
import { CollectibleTile } from './CollectibleTile'
import { SkeletonTiles } from './SkeletonTiles'

import { Box, Spinner, vars } from '@0xsequence/design-system'
import { ContractVerificationStatus, TokenBalance } from '@0xsequence/indexer'
import { useWalletSettings } from '@0xsequence/kit'
import { useGetTokenBalancesDetails } from '@0xsequence/kit-hooks'

export const AssetSummary = () => {
  const { address } = useAccount()
  const { setNavigation } = useNavigation()
  const { displayedAssets } = useWalletSettings()
  const { hideUnlistedTokens, hideCollectibles, selectedNetworks } = useSettings()

  const pageSize = 10
  const [isLoading, setIsLoading] = useState(false)
  const [displayedTokens, setDisplayedTokens] = useState<TokenBalance[]>([])
  const [hasMoreTokens, setHasMoreTokens] = useState(false)

  const endOfPageRef = useRef<HTMLDivElement | null>(null)

  const fetchMoreTokens = () => {
    if (displayedTokens.length >= balances.length) {
      setHasMoreTokens(false)
      return
    }
    setDisplayedTokens(balances.slice(0, displayedTokens.length + pageSize))
  }

  useEffect(() => {
    if (!endOfPageRef.current) return

    const observer = new IntersectionObserver(entries => {
      const endOfPage = entries[0]
      if (endOfPage.isIntersecting && hasMoreTokens) {
        setIsLoading(true)
        setTimeout(() => {
          fetchMoreTokens()
          setIsLoading(false)
        }, 500)
      }
    })

    observer.observe(endOfPageRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasMoreTokens, fetchMoreTokens])

  const { data: balances = [], isPending: isPendingBalances } = useGetTokenBalancesDetails(
    {
      filter: {
        accountAddresses: [address || ''],
        contractWhitelist: displayedAssets.map(asset => asset.contractAddress),
        contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
        omitNativeBalances: false
      },
      chainIds: selectedNetworks
    },
    { hideCollectibles }
  )

  useEffect(() => {
    if (!isPendingBalances && balances.length > 0) {
      const filteredBalances = balances.filter(balance =>
        displayedAssets.some(asset => asset.contractAddress === balance.contractAddress && asset.chainId === balance.chainId)
      )
      setDisplayedTokens(filteredBalances.slice(0, pageSize))
      setHasMoreTokens(filteredBalances.length > pageSize)
    }
    // only runs once after balances are fetched
  }, [balances, isPendingBalances])

  if (isPendingBalances) {
    return <SkeletonTiles />
  }

  const onClickItem = (balance: TokenBalance) => {
    if (balance.contractType === 'ERC1155' || balance.contractType === 'ERC721') {
      setNavigation &&
        setNavigation({
          location: 'collectible-details',
          params: {
            contractAddress: balance.contractAddress,
            chainId: balance.chainId,
            tokenId: balance.tokenID || ''
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
    <Box>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: `calc(50% - ${vars.space[1]}) calc(50% - ${vars.space[1]})`,
          gap: vars.space[2]
        }}
      >
        {displayedTokens.map((balance, index) => {
          return (
            <Box
              key={index}
              userSelect="none"
              cursor="pointer"
              opacity={{ hover: '80' }}
              aspectRatio="1/1"
              onClick={() => onClickItem(balance)}
            >
              {balance.contractType === 'ERC1155' || balance.contractType === 'ERC721' ? (
                <CollectibleTile balance={balance} />
              ) : (
                <CoinTile balance={balance} />
              )}
            </Box>
          )
        })}
      </Box>
      {isLoading && <Spinner justifySelf="center" marginTop="3" />}
      <div ref={endOfPageRef} style={{ height: '1px' }} />
    </Box>
  )
}
