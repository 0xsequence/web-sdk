import { useGetTokenBalancesDetails } from '@0xsequence/hooks'
import { ContractType, ContractVerificationStatus } from '@0xsequence/indexer'
import { useEffect } from 'react'

export const useGetCollections = ({
  accountAddresses,
  chainIds,
  hideUnlistedTokens
}: {
  accountAddresses: string[]
  chainIds: number[]
  hideUnlistedTokens: boolean
}) => {
  const {
    data: tokenBalancesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetTokenBalancesDetails({
    chainIds,
    filter: {
      accountAddresses,
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      omitNativeBalances: false
    },
    page: { pageSize: 40 }
  })

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage])

  const collections = tokenBalancesData?.pages
    .flatMap(page => page.balances)
    .filter(token => token.contractType === ContractType.ERC721 || token.contractType === ContractType.ERC1155)
    .map(collectible => {
      return {
        contractAddress: collectible.contractAddress,
        chainId: collectible.chainId,
        name: collectible.contractInfo?.name || '',
        logoURI: collectible.contractInfo?.logoURI || ''
      }
    })

  const uniqueCollections = Array.from(
    new Map(collections?.map(collection => [collection?.contractAddress, collection])).values()
  )

  return {
    data: uniqueCollections,
    isLoading: isLoading || isFetchingNextPage
  }
}
