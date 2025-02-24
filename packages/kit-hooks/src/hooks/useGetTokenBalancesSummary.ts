import { useQuery } from '@tanstack/react-query'

import { time } from '../constants/hooks'
import { createNativeTokenBalance, sortBalancesByType } from '../utils/helpers'
import { useIndexerGatewayClient } from './useIndexerGatewayClient'

import { ContractType, IndexerGateway, SequenceIndexerGateway, TokenBalance } from '@0xsequence/indexer'

const getTokenBalancesSummary = async (
  getTokenBalancesSummaryArgs: IndexerGateway.GetTokenBalancesSummaryArgs,
  indexerGatewayClient: SequenceIndexerGateway,
  hideCollectibles: boolean
): Promise<TokenBalance[]> => {
  try {
    const res = await indexerGatewayClient.getTokenBalancesSummary(getTokenBalancesSummaryArgs)

    if (hideCollectibles) {
      for (const chainBalance of res.balances) {
        chainBalance.results = chainBalance.results.filter(
          result =>
            result.contractType !== ContractType.ERC721 && result.contractType !== ContractType.ERC1155
        )
      }
    }

    const nativeTokens: TokenBalance[] = res.nativeBalances.flatMap(nativeChainBalance =>
      nativeChainBalance.results.map(nativeTokenBalance =>
        createNativeTokenBalance(
          nativeChainBalance.chainId,
          nativeTokenBalance.accountAddress,
          nativeTokenBalance.balance
        )
      )
    )

    const tokens: TokenBalance[] = res.balances.flatMap(chainBalance => chainBalance.results)

    const sortedBalances = sortBalancesByType([...nativeTokens, ...tokens])

    return [...sortedBalances.nativeTokens, ...sortedBalances.erc20Tokens, ...sortedBalances.collectibles]
  } catch (e) {
    throw e
  }
}

export const useGetTokenBalancesSummary = (
  getTokenBalancesSummaryArgs: IndexerGateway.GetTokenBalancesSummaryArgs,
  options?: { hideCollectibles?: boolean; disabled?: boolean; retry?: boolean }
) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useQuery({
    queryKey: ['tokenBalancesSummary', getTokenBalancesSummaryArgs, options],
    queryFn: async () => {
      return await getTokenBalancesSummary(
        getTokenBalancesSummaryArgs,
        indexerGatewayClient,
        options?.hideCollectibles ?? false
      )
    },
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!getTokenBalancesSummaryArgs.filter.accountAddresses[0] && !options?.disabled
  })
}
