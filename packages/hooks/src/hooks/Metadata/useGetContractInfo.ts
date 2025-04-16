import { ContractInfo, GetContractInfoArgs } from '@0xsequence/metadata'
import { findSupportedNetwork } from '@0xsequence/network'
import { UseQueryResult, useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, ZERO_ADDRESS, time } from '../../constants'
import { HooksOptions } from '../../types'
import { compareAddress } from '../../utils/helpers'

import { useMetadataClient } from './useMetadataClient'

/**
 * Hook to fetch contract information.
 * Handles ERC20/ERC721/ERC1155 contracts and native tokens (using ZERO_ADDRESS).
 *
 * For native tokens (like ETH, POL), it enriches the response with network-specific
 * information like the native token symbol and network logo.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetContractInfo} for more detailed documentation.
 *
 * @param getContractInfoArgs - Arguments for fetching contract info
 * @param getContractInfoArgs.chainID - Chain ID as string (e.g., "1" for Ethereum mainnet)
 * @param getContractInfoArgs.contractAddress - Contract address or ZERO_ADDRESS for native token
 * @param options - Optional configuration for the query behavior
 * @param options.disabled - If true, disables the query from automatically running
 * @param options.retry - If true (default), retries failed queries
 *
 * Query configuration:
 * - Marks data as stale after 10 minutes
 * - Retries failed requests by default
 * - Only enabled when chainID and contractAddress are present and not explicitly disabled
 *
 * @returns Query result containing contract information:
 * - `name`: Contract/token name
 * - `symbol`: Token symbol
 * - `decimals`: Token decimals (if applicable)
 * - `logoURI`: URL of the contract/token logo
 * - `type`: Contract type (e.g., "ERC721", "ERC20")
 * - Additional metadata from the contract
 *
 * @example
 * ```tsx
 * // Fetch NFT collection info
 * function CollectionDetails() {
 *   const { data: contractInfo } = useGetContractInfo({
 *     chainID: "1",
 *     contractAddress: "0x123..."
 *   })
 *
 *   return (
 *     <div>
 *       <img src={contractInfo?.logoURI} />
 *       <h1>{contractInfo?.name}</h1>
 *       <span>Type: {contractInfo?.type}</span>
 *     </div>
 *   )
 * }
 *
 * // Used in checkout for displaying collection info
 * function OrderSummaryItem() {
 *   const { data: contractInfo } = useGetContractInfo({
 *     chainID: String(chainId),
 *     contractAddress
 *   })
 *
 *   return (
 *     <div>
 *       <TokenImage src={contractInfo?.logoURI} />
 *       <Text>{contractInfo?.name || 'Unknown Collection'}</Text>
 *     </div>
 *   )
 * }
 * ```
 */
export const useGetContractInfo = (args: GetContractInfoArgs, options?: HooksOptions): UseQueryResult<ContractInfo> => {
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetContractInfo, args, options],
    queryFn: async () => {
      const isNativeToken = compareAddress(ZERO_ADDRESS, args.contractAddress)

      const res = await metadataClient.getContractInfo(args)
      const network = findSupportedNetwork(args.chainID)

      return {
        ...res.contractInfo,
        ...(isNativeToken && network
          ? {
              ...network.nativeToken,
              logoURI: network.logoURI
            }
          : {})
      }
    },
    retry: options?.retry ?? true,
    staleTime: time.oneMinute * 10,
    enabled: !!args.chainID && !!args.contractAddress && !options?.disabled
  })
}
