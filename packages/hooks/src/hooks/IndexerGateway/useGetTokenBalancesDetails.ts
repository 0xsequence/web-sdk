import { SequenceIndexerGateway, type IndexerGateway, type Page, type TokenBalance } from '@0xsequence/indexer'
import { useInfiniteQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants.js'
import type { HooksOptions } from '../../types/hooks.js'
import { createNativeTokenBalance, sortBalancesByType } from '../../utils/helpers.js'

import { useIndexerGatewayClient } from './useIndexerGatewayClient.js'

const getTokenBalancesDetails = async (
  indexerGatewayClient: SequenceIndexerGateway,
  args: IndexerGateway.GetTokenBalancesDetailsArgs
) => {
  try {
    const res = await indexerGatewayClient.getTokenBalancesDetails(args)

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
 * Hook to fetch detailed token balances including individual token metadata.
 *
 * Key differences from other balance hooks:
 * - useGetTokenBalancesSummary: Returns basic token info, faster but less detailed
 * - useGetTokenBalancesByContract: Only fetches specific contracts
 * - useGetSingleTokenBalanceSummary: Fetches a single token balance
 *
 * This hook is best used when you need full token details, especially for NFTs and collectibles
 * where metadata is important (images, attributes, etc).
 * Results are sorted by type: native tokens first, then ERC20s, then collectibles.
 *
 * @param getTokenBalancesDetailsArgs - Arguments for fetching token balances
 * @param getTokenBalancesDetailsArgs.chainIds - Array of chain IDs to fetch balances from
 * @param getTokenBalancesDetailsArgs.filter - Filter criteria for the query
 * @param getTokenBalancesDetailsArgs.filter.accountAddresses - List of account addresses to fetch balances for
 * @param getTokenBalancesDetailsArgs.filter.contractWhitelist - Optional list of contracts to include
 * @param getTokenBalancesDetailsArgs.filter.contractBlacklist - Optional list of contracts to exclude
 * @param getTokenBalancesDetailsArgs.filter.omitNativeBalances - If true, excludes native token balances
 * @param getTokenBalancesDetailsArgs.filter.contractStatus - Optional filter for contract verification status
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
 * @returns Query result containing an array of TokenBalance objects with detailed information:
 * - `contractType`: Type of the token contract (NATIVE, ERC20, ERC721, ERC1155)
 * - `contractAddress`: Address of the token contract
 * - `accountAddress`: Address of the account holding the tokens
 * - `tokenID`: (for NFTs) ID of the token
 * - `balance`: Token balance as a string
 * - `blockHash`: Hash of the block where this balance was last updated
 * - `blockNumber`: Block number where this balance was last updated
 * - `chainId`: Chain ID where the token exists
 * - `contractInfo`: Additional token contract information including:
 *   - `name`: Token name
 *   - `symbol`: Token symbol
 *   - `decimals`: Number of decimals
 *   - `logoURI`: URL of the token logo
 * - `tokenMetadata`: (for NFTs) Detailed token metadata including:
 *   - `name`: Token name
 *   - `description`: Token description
 *   - `image`: Token image URL
 *   - `attributes`: Array of token attributes
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetTokenBalancesDetails} for more detailed documentation.
 *
 * @example
 * ```tsx
 * import { useGetTokenBalancesDetails } from '@0xsequence/hooks'
 *
 * // Fetch all token balances with full details
 * function TokenList() {
 *   const { data: tokens } = useGetTokenBalancesDetails({
 *     chainIds: [1], // Ethereum mainnet
 *     filter: {
 *       accountAddresses: ['0x123...'],
 *       omitNativeBalances: false,
 *       // Optional: only include specific tokens
 *       contractWhitelist: ['0x...', '0x...'],
 *       // Optional: exclude specific tokens
 *       contractBlacklist: ['0x...']
 *     }
 *   })
 *
 *   return tokens?.map(token => (
 *     <div key={`${token.chainId}-${token.contractAddress}-${token.tokenID}`}>
 *       {token.contractType === 'ERC721' ? (
 *         // NFT display with metadata
 *         <NFTCard
 *           name={token.tokenMetadata?.name}
 *           image={token.tokenMetadata?.image}
 *           attributes={token.tokenMetadata?.attributes}
 *         />
 *       ) : (
 *         // Regular token display
 *         <TokenRow
 *           symbol={token.contractInfo?.symbol}
 *           balance={token.balance}
 *           decimals={token.contractInfo?.decimals}
 *         />
 *       )}
 *     </div>
 *   ))
 * }
 * ```
 */
export const useGetTokenBalancesDetails = (args: IndexerGateway.GetTokenBalancesDetailsArgs, options?: HooksOptions) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.useGetTokenBalancesDetails, args, options],
    queryFn: ({ pageParam }) => {
      return getTokenBalancesDetails(indexerGatewayClient, { ...args, page: pageParam })
    },
    getNextPageParam: ({ page }) => {
      return page?.more ? page : undefined
    },
    initialPageParam: { ...args?.page } as Page,
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: args.filter.accountAddresses.length > 0 && !options?.disabled
  })
}
