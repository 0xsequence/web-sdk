import { useGetTokenBalancesDetails } from '@0xsequence/hooks'
import type { TokenBalance } from '@0xsequence/indexer'
import { ContractVerificationStatus } from '@0xsequence/indexer'
import { useEffect } from 'react'

export const useGetAllTokensDetails = ({
  accountAddresses,
  chainIds,
  hideUnlistedTokens
}: {
  accountAddresses: string[]
  chainIds: number[]
  hideUnlistedTokens: boolean
}): { data: TokenBalance[]; isLoading: boolean } => {
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

  return {
    data: tokenBalancesData?.pages.flatMap(page => page.balances) || [],
    isLoading: isLoading || isFetchingNextPage
  }
}
