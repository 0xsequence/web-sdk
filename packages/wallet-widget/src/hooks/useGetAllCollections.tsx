import { useGetMultipleContractsInfo, useGetTokenBalancesSummary } from '@0xsequence/hooks'
import { ContractVerificationStatus } from '@0xsequence/indexer'
import { useEffect } from 'react'

interface UseGetAllCollectionsArgs {
  accountAddresses: string[]
  chainIds: number[]
  hideUnlistedTokens: boolean
}

export interface CollectionInfo {
  address: string
  chainId: number
  logoURI: string
  name: string
}

interface UseGetAllCollectionsReturn {
  data: CollectionInfo[]
  isLoading: boolean
}

export const useGetAllCollections = ({
  accountAddresses,
  chainIds,
  hideUnlistedTokens
}: UseGetAllCollectionsArgs): UseGetAllCollectionsReturn => {
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
