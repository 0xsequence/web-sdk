import { SequenceIndexerGateway, type IndexerGateway, type Page } from '@0xsequence/indexer'
import { useInfiniteQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import type { HooksOptions } from '../../types'

import { useIndexerGatewayClient } from './useIndexerGatewayClient'

const getTokenBalancesByContract = async (
  indexerGatewayClient: SequenceIndexerGateway,
  args: IndexerGateway.GetTokenBalancesByContractArgs
) => {
  const res = await indexerGatewayClient.getTokenBalancesByContract(args)

  return {
    balances: res.balances.flatMap(balance => balance.results),
    page: res.page
  }
}

/**
 * Hook to fetch token balances by contract address.
 * Can be used to fetch multiple token balances in a single request.
 *
 * @param getTokenBalancesByContractArgs - Arguments for fetching token balances
 * @param getTokenBalancesByContractArgs.chainIds - Array of chain IDs to fetch balances from
 * @param getTokenBalancesByContractArgs.filter - Filter criteria for the query
 * @param getTokenBalancesByContractArgs.filter.contractAddresses - List of token contract addresses to fetch balances for
 * @param getTokenBalancesByContractArgs.filter.accountAddresses - Optional list of account addresses to fetch balances for
 * @param getTokenBalancesByContractArgs.filter.contractStatus - Optional filter for contract verification status
 * @param options - Optional configuration for the query behavior
 * @param options.hideCollectibles - If true, filters out ERC721 and ERC1155 tokens from the results
 * @param options.disabled - If true, disables the query from automatically running
 * @param options.retry - If true, retries failed queries
 *
 * @returns Query result containing an array of TokenBalance objects with the following properties:
 * - `contractType`: Type of the token contract (ERC20, ERC721, ERC1155)
 * - `contractAddress`: Address of the token contract
 * - `accountAddress`: Address of the account holding the tokens
 * - `tokenID`: (for ERC721/ERC1155) ID of the token
 * - `balance`: Token balance as a string
 * - `blockHash`: Hash of the block where this balance was last updated
 * - `blockNumber`: Block number where this balance was last updated
 * - `chainId`: Chain ID where the token exists
 * - `contractInfo`: (optional) Additional token contract information including:
 *   - `name`: Token name
 *   - `symbol`: Token symbol
 *   - `decimals`: Number of decimals (for ERC20)
 *   - `logoURI`: URL of the token logo
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetTokenBalancesByContract} for more detailed documentation.
 *
 * @example
 * ```tsx
 * function TokenBalances() {
 *   const { data: balances } = useGetTokenBalancesByContract({
 *     chainIds: [1], // Ethereum mainnet
 *     filter: {
 *       contractAddresses: [
 *         '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
 *         '0xdac17f958d2ee523a2206206994597c13d831ec7'  // USDT
 *       ],
 *       accountAddresses: ['0x123...']
 *     }
 *   })
 *
 *   return balances?.map(balance => (
 *     <div key={balance.contractAddress}>
 *       {balance.contractInfo?.symbol}: {balance.balance}
 *     </div>
 *   ))
 * }
 * ```
 */
export const useGetTokenBalancesByContract = (args: IndexerGateway.GetTokenBalancesByContractArgs, options?: HooksOptions) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.useGetTokenBalancesByContract, args, options],
    queryFn: ({ pageParam }) => {
      return getTokenBalancesByContract(indexerGatewayClient, { ...args, page: pageParam })
    },
    getNextPageParam: ({ page }) => {
      return page?.more ? page : undefined
    },
    initialPageParam: { pageSize: args.page?.pageSize } as Page,
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: args.filter.contractAddresses.length > 0 && !options?.disabled
  })
}
