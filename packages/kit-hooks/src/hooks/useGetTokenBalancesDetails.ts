import { useQuery } from '@tanstack/react-query'

import { time } from '../constants/hooks'
import { createNativeTokenBalance, sortBalancesByType } from '../utils/helpers'
import { useIndexerGatewayClient } from './useIndexerGatewayClient'

import { ContractType, IndexerGateway, SequenceIndexerGateway, TokenBalance } from '@0xsequence/indexer'

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

export const useGetTokenBalancesDetails = (
  getTokenBalancesDetailsArgs: IndexerGateway.GetTokenBalancesDetailsArgs,
  options?: { hideCollectibles?: boolean; disabled?: boolean; retry?: boolean }
) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useQuery({
    queryKey: ['tokenBalancesDetails', getTokenBalancesDetailsArgs, options],
    queryFn: async () => {
      return await getTokenBalancesDetails(
        getTokenBalancesDetailsArgs,
        indexerGatewayClient,
        options?.hideCollectibles ?? false
      )
    },
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!getTokenBalancesDetailsArgs.filter.accountAddresses[0] && !options?.disabled
  })
}
