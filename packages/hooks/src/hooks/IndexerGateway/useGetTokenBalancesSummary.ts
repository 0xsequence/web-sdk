import { ContractType, IndexerGateway, Page, SequenceIndexerGateway, TokenBalance } from '@0xsequence/indexer'
import { useInfiniteQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { BalanceHookOptions } from '../../types'
import { createNativeTokenBalance, sortBalancesByType } from '../../utils/helpers'

import { useIndexerGatewayClient } from './useIndexerGatewayClient'

const getTokenBalancesSummary = async (
  indexerGatewayClient: SequenceIndexerGateway,
  args: IndexerGateway.GetTokenBalancesSummaryArgs,
  hideCollectibles: boolean
) => {
  try {
    const res = await indexerGatewayClient.getTokenBalancesSummary(args)

    if (hideCollectibles) {
      for (const chainBalance of res.balances) {
        chainBalance.results = chainBalance.results.filter(
          result => result.contractType !== ContractType.ERC721 && result.contractType !== ContractType.ERC1155
        )
      }
    }

    const nativeTokens: TokenBalance[] = res.nativeBalances.flatMap(nativeChainBalance =>
      nativeChainBalance.results.map(nativeTokenBalance =>
        createNativeTokenBalance(nativeChainBalance.chainId, nativeTokenBalance.accountAddress, nativeTokenBalance.balance)
      )
    )

    const tokens: TokenBalance[] = res.balances.flatMap(chainBalance => chainBalance.results)

    const sortedBalances = sortBalancesByType([...nativeTokens, ...tokens])

    return {
      balances: [...sortedBalances.nativeTokens, ...sortedBalances.erc20Tokens, ...sortedBalances.collectibles],
      page: res.page
    }
  } catch (e) {
    throw e
  }
}

/**
 * @description Gets the token balances, with summarized contract info but not individual token details for non-native contracts
 */
export const useGetTokenBalancesSummary = (args: IndexerGateway.GetTokenBalancesSummaryArgs, options?: BalanceHookOptions) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.useGetTokenBalancesSummary, args, options],
    queryFn: ({ pageParam }) => {
      return getTokenBalancesSummary(indexerGatewayClient, { ...args, page: pageParam }, options?.hideCollectibles ?? false)
    },
    getNextPageParam: ({ page }) => {
      return page?.more ? page : undefined
    },
    initialPageParam: { pageSize: args.page?.pageSize } as Page,
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: args.filter.accountAddresses.length > 0 && !options?.disabled
  })
}
