import { SequenceIndexerGateway, type IndexerGateway, type Page, type TokenBalance } from '@0xsequence/indexer'
import { useInfiniteQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants.js'
import type { HooksOptions } from '../../types/hooks.js'
import { createNativeTokenBalance, sortBalancesByType } from '../../utils/helpers.js'

import { useIndexerGatewayClient } from './useIndexerGatewayClient.js'

const getTokenBalancesSummary = async (
  indexerGatewayClient: SequenceIndexerGateway,
  args: IndexerGateway.GetTokenBalancesSummaryArgs
) => {
  try {
    const res = await indexerGatewayClient.getTokenBalancesSummary(args)

    const nativeTokens: TokenBalance[] = res.nativeBalances.flatMap(nativeChainBalance =>
      nativeChainBalance.results.map(nativeTokenBalance =>
        createNativeTokenBalance(nativeChainBalance.chainId, nativeTokenBalance.accountAddress, nativeTokenBalance.balance)
      )
    )

    const tokens: TokenBalance[] = res.balances.flatMap(chainBalance => chainBalance.results)

    const sortedBalances = sortBalancesByType([...nativeTokens, ...tokens])

    return {
      balances: [
        ...(res.page.after ? [] : [...sortedBalances.nativeTokens]),
        ...sortedBalances.erc20Tokens,
        ...sortedBalances.collectibles
      ],
      page: res.page
    }
  } catch (e) {
    throw e
  }
}

/**
 * Hook to fetch token balances with summarized contract information.
 * This is a lighter version of useGetTokenBalancesDetails - it returns basic token information
 * without detailed metadata, making it faster and more suitable for token lists and balances display.
 * Results are sorted by type: native tokens first, then ERC20s, then collectibles.
 *
 * @param getTokenBalancesSummaryArgs - Arguments for fetching token balances
 * @param getTokenBalancesSummaryArgs.chainIds - Array of chain IDs to fetch balances from
 * @param getTokenBalancesSummaryArgs.filter - Filter criteria for the query
 * @param getTokenBalancesSummaryArgs.filter.accountAddresses - List of account addresses to fetch balances for
 * @param getTokenBalancesSummaryArgs.filter.contractWhitelist - Optional list of contracts to include
 * @param getTokenBalancesSummaryArgs.filter.contractBlacklist - Optional list of contracts to exclude
 * @param getTokenBalancesSummaryArgs.filter.omitNativeBalances - If true, excludes native token balances
 * @param getTokenBalancesSummaryArgs.filter.contractStatus - Optional filter for contract verification status
 * @param options - Optional configuration for the query behavior
 * @param options.hideCollectibles - If true, filters out ERC721 and ERC1155 tokens
 * @param options.disabled - If true, disables the query from automatically running
 * @param options.retry - If true (default), retries failed queries
 *
 * Query configuration:
 * - Marks data as stale after 30 seconds
 * - Retries failed requests by default
 * - Only enabled when account address is present and not explicitly disabled
 *
 * @returns Query result containing an array of TokenBalance objects with basic information:
 * - `contractType`: Type of the token contract (NATIVE, ERC20, ERC721, ERC1155)
 * - `contractAddress`: Address of the token contract
 * - `accountAddress`: Address of the account holding the tokens
 * - `balance`: Token balance as a string
 * - `chainId`: Chain ID where the token exists
 * - `contractInfo`: Basic token contract information including:
 *   - `name`: Token name
 *   - `symbol`: Token symbol
 *   - `decimals`: Number of decimals
 *   - `logoURI`: URL of the token logo
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetTokenBalancesSummary} for more detailed documentation.
 *
 * @example
 * ```tsx
 * import { useGetTokenBalancesSummary } from '@0xsequence/hooks'
 *
 * // Fetch token balances for a wallet
 * function TokenBalances() {
 *   const { data: tokens } = useGetTokenBalancesSummary({
 *     chainIds: [1, 137], // Ethereum and Polygon
 *     filter: {
 *       accountAddresses: ['0x123...'],
 *       omitNativeBalances: false,
 *       // Optional: filter specific tokens
 *       contractWhitelist: ['0x...', '0x...']
 *     }
 *   })
 *
 *   return tokens?.map(token => (
 *     <div key={`${token.chainId}-${token.contractAddress}`}>
 *       <TokenRow
 *         symbol={token.contractInfo?.symbol}
 *         balance={token.balance}
 *         decimals={token.contractInfo?.decimals}
 *         logoURI={token.contractInfo?.logoURI}
 *       />
 *     </div>
 *   ))
 * }
 * ```
 */
export const useGetTokenBalancesSummary = (args: IndexerGateway.GetTokenBalancesSummaryArgs, options?: HooksOptions) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.useGetTokenBalancesSummary, args, options],
    queryFn: ({ pageParam }) => {
      return getTokenBalancesSummary(indexerGatewayClient, { ...args, page: pageParam })
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
