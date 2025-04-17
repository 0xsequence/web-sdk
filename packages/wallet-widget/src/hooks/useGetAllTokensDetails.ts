import { useGetTokenBalancesDetails } from '@0xsequence/hooks'
import { ContractVerificationStatus } from '@0xsequence/indexer'

export const useGetAllTokensDetails = ({
  accountAddresses,
  chainIds,
  contractWhitelist,
  hideUnlistedTokens
}: {
  accountAddresses: string[]
  chainIds: number[]
  contractWhitelist?: string[]
  hideUnlistedTokens: boolean
}) => {
  const {
    data: tokenBalancesData,
    isFetching,
    fetchNextPage,
    hasNextPage
  } = useGetTokenBalancesDetails({
    chainIds,
    filter: {
      accountAddresses,
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      contractWhitelist: contractWhitelist ?? [],
      omitNativeBalances: false
    },
    page: { pageSize: 40 }
  })

  while (hasNextPage) {
    fetchNextPage()
  }

  return {
    data: tokenBalancesData?.pages.flatMap(page => page.balances) || [],
    isPending: isFetching
  }
}
