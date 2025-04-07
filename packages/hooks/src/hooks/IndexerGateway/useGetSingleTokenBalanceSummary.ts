import { ContractType, SequenceIndexerGateway } from '@0xsequence/indexer'
import { useQuery } from '@tanstack/react-query'

import { ZERO_ADDRESS, QUERY_KEYS, time } from '../../constants'
import { BalanceHookOptions } from '../../types'
import { compareAddress, createNativeTokenBalance } from '../../utils/helpers'

import { useIndexerGatewayClient } from './useIndexerGatewayClient'

export interface GetSingleTokenBalanceSummaryArgs {
  chainId: number
  accountAddress: string
  contractAddress: string
}

const getSingleTokenBalanceSummary = async (
  args: GetSingleTokenBalanceSummaryArgs,
  indexerGatewayClient: SequenceIndexerGateway,
  hideCollectibles: boolean
) => {
  const balance = await indexerGatewayClient.getTokenBalancesSummary({
    chainIds: [args.chainId],
    filter: {
      accountAddresses: [args.accountAddress],
      contractWhitelist: [args.contractAddress],
      omitNativeBalances: false
    }
  })

  if (hideCollectibles) {
    for (const chainBalance of balance.balances) {
      chainBalance.results = chainBalance.results.filter(
        result => result.contractType !== ContractType.ERC721 && result.contractType !== ContractType.ERC1155
      )
    }
  }

  if (compareAddress(args.contractAddress, ZERO_ADDRESS)) {
    return createNativeTokenBalance(args.chainId, args.accountAddress, balance.nativeBalances[0].results[0].balance)
  } else {
    return balance.balances[0].results[0]
  }
}

/**
 * Hook to fetch the balance of a specific token (native or ERC20) for an account on a specific chain.
 * For native tokens, use ZERO_ADDRESS (0x0000...0000) as the contractAddress.
 *
 * @param args - Arguments for fetching the token balance
 * @param args.chainId - The chain ID to fetch the balance from
 * @param args.accountAddress - The address to fetch the balance for
 * @param args.contractAddress - The token contract address (use ZERO_ADDRESS for native tokens)
 * @param options - Optional configuration for the query behavior
 * @param options.hideCollectibles - If true, filters out ERC721 and ERC1155 tokens
 *
 * @returns Query result containing the token balance
 *
 * @example
 * ```tsx
 * import { useGetSingleTokenBalanceSummary, ZERO_ADDRESS } from '@0xsequence/hooks'
 *
 * // Fetch native ETH balance
 * function NativeBalance() {
 *   const { data: ethBalance } = useGetSingleTokenBalanceSummary({
 *     chainId: 1,
 *     accountAddress: '0x123...',
 *     contractAddress: ZERO_ADDRESS
 *   })
 *   return <div>ETH Balance: {ethBalance?.balance}</div>
 * }
 *
 * // Fetch USDC balance
 * function TokenBalance() {
 *   const { data: usdcBalance } = useGetSingleTokenBalanceSummary({
 *     chainId: 1,
 *     accountAddress: '0x123...',
 *     contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
 *   })
 *   return <div>USDC Balance: {usdcBalance?.balance}</div>
 * }
 * ```
 */
export const useGetSingleTokenBalanceSummary = (args: GetSingleTokenBalanceSummaryArgs, options?: BalanceHookOptions) => {
  const indexerGatewayClient = useIndexerGatewayClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetSingleTokenBalanceSummary, args, options],
    queryFn: async () => {
      return await getSingleTokenBalanceSummary(args, indexerGatewayClient, options?.hideCollectibles ?? false)
    },
    retry: options?.retry ?? true,
    staleTime: time.oneSecond * 30,
    enabled: !!args.chainId && !!args.accountAddress && !options?.disabled
  })
}
