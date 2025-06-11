import { useGetMultipleContractsInfo, useGetTokenBalancesSummary } from '@0xsequence/hooks'
import { ContractVerificationStatus } from '@0xsequence/indexer'
import { useEffect } from 'react'

export const useGetAllCollections = ({
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
  } = useGetTokenBalancesSummary({
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

  const collections = tokenBalancesData?.pages.flatMap(page =>
    page.balances.filter(balance => balance.contractType === 'ERC721' || balance.contractType === 'ERC1155')
  )

  const { data: collectionsWithMetadata } = useGetMultipleContractsInfo(
    collections?.map(collection => ({
      chainID: collection.chainId.toString(),
      contractAddress: collection.contractAddress
    })) || []
  )

  return {
    data: collectionsWithMetadata || [],
    isLoading: isLoading || isFetchingNextPage
  }
}
