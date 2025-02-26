import { ContractType, IndexerGateway, SequenceIndexerGateway, TokenBalance } from '@0xsequence/indexer'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { BalanceHookOptions } from '../../types'
import { createNativeTokenBalance, sortBalancesByType } from '../../utils/helpers'

import { useIndexerGatewayClient } from './useIndexerGatewayClient'

const getTokenBalancesDetails = async (
  getTokenBalancesDetailsArgs: IndexerGateway.GetTokenBalancesDetailsArgs,
  indexerGatewayClient: SequenceIndexerGateway,
  hideCollectibles: boolean
): Promise<TokenBalance[]> => {
  try {
    const res = await indexerGatewayClient.getTokenBalancesDetails(getTokenBalancesDetailsArgs)

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

    return [...sortedBalances.nativeTokens, ...sortedBalances.erc20Tokens, ...sortedBalances.collectibles]
  } catch (e) {
    throw e
  }
}

/**
 * @description Gets token balances, with individual token details
 */
export const useGetTokenBalancesDetails = (
  getTokenBalancesDetailsArgs: IndexerGateway.GetTokenBalancesDetailsArgs,
  options?: BalanceHookOptions
) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetTokenBalancesDetails, getTokenBalancesDetailsArgs, options],
    queryFn: async () => {
      return await getTokenBalancesDetails(getTokenBalancesDetailsArgs, indexerGatewayClient, options?.hideCollectibles ?? false)
    },
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!getTokenBalancesDetailsArgs.filter.accountAddresses[0] && !options?.disabled
  })
}
