import { ContractInfo, SequenceMetadata, GetContractInfoArgs } from '@0xsequence/metadata'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { HooksOptions } from '../../types'

import { useMetadataClient } from './useMetadataClient'

const getMultipleContractsInfo = async (
  metadataClient: SequenceMetadata,
  arg: GetContractInfoArgs[]
): Promise<ContractInfo[]> => {
  try {
    const res = await Promise.all(arg.map(a => metadataClient.getContractInfo(a)))

    return res.map(r => r.contractInfo)
  } catch (e) {
    throw e
  }
}

/**
 * Hook to fetch contract information for multiple contracts in parallel.
 * This is a batch version of {@link useGetContractInfo} that optimizes fetching metadata
 * for multiple contracts in a single hook.
 *
 * Supports fetching contracts from different chains in a single query, making it ideal
 * for cross-chain applications. Can fetch any combination of NFTs (ERC721/ERC1155) and
 * tokens (ERC20) across different chains simultaneously.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetMultipleContractsInfo} for more detailed documentation.
 *
 * @param useGetMultipleContractsInfoArgs - Array of contract info arguments
 * @param useGetMultipleContractsInfoArgs[].chainID - Chain ID as string (e.g., "1" for Ethereum mainnet)
 * @param useGetMultipleContractsInfoArgs[].contractAddress - Contract address to fetch info for
 * @param options - Optional configuration for the query behavior
 * @param options.disabled - If true, disables the query from automatically running
 * @param options.retry - If true (default), retries failed queries
 *
 * Query configuration:
 * - Uses a 1 hour stale time (compared to 10 minutes for single contract info)
 * - Retries failed requests by default
 * - Enabled by default unless explicitly disabled
 * - Fetches all contracts in parallel regardless of chain
 *
 * @returns Query result containing an array of contract information objects, each containing:
 * - `name`: Contract/token name
 * - `symbol`: Token symbol
 * - `decimals`: Token decimals (if applicable)
 * - `logoURI`: URL of the contract/token logo
 * - `type`: Contract type (e.g., "ERC721", "ERC20", "ERC1155")
 * - Additional metadata from each contract
 *
 * @example
 * ```tsx
 * // Cross-chain NFT and Token Portfolio
 * function CrossChainPortfolio() {
 *   const { data: contractsInfo, isLoading } = useGetMultipleContractsInfo([
 *     // NFTs
 *     { chainID: "1", contractAddress: "0xbc4ca0..." },
 *     { chainID: "1", contractAddress: "0x60e4d7..." },
 *     { chainID: "137", contractAddress: "0x631998..." },
 *     // Tokens
 *     { chainID: "1", contractAddress: "0xa0b86991..." },
 *     { chainID: "137", contractAddress: "0x2791bca..." }
 *   ])
 *
 *   if (isLoading) return <div>Loading portfolio...</div>
 *
 *   const nfts = contractsInfo?.filter(info =>
 *     info.type === 'ERC721' || info.type === 'ERC1155'
 *   ) || []
 *
 *   const tokens = contractsInfo?.filter(info =>
 *     info.type === 'ERC20'
 *   ) || []
 *
 *   return (
 *     <div className="portfolio">
 *       <div className="nft-section">
 *         <h2>NFT Collections</h2>
 *         {nfts.map((nft, index) => (
 *           <div key={index} className="nft-card">
 *             <img src={nft.logoURI} alt={nft.name} />
 *             <div className="nft-info">
 *               <Text variant="title">{nft.name}</Text>
 *               <Text>Collection Type: {nft.type}</Text>
 *               <Text>Chain: {nft.chainID}</Text>
 *             </div>
 *           </div>
 *         ))}
 *       </div>
 *
 *       <div className="token-section">
 *         <h2>Tokens</h2>
 *         {tokens.map((token, index) => (
 *           <div key={index} className="token-card">
 *             <TokenImage src={token.logoURI} />
 *             <div className="token-info">
 *               <Text>{token.name}</Text>
 *               <Text>Symbol: {token.symbol}</Text>
 *               <Text>Chain: {token.chainID}</Text>
 *               <Text>Decimals: {token.decimals}</Text>
 *             </div>
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   )
 * }
 * ```
 */
export const useGetMultipleContractsInfo = (useGetMultipleContractsInfoArgs: GetContractInfoArgs[], options?: HooksOptions) => {
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetMultipleContractInfo, useGetMultipleContractsInfoArgs, options],
    queryFn: async () => await getMultipleContractsInfo(metadataClient, useGetMultipleContractsInfoArgs),
    retry: options?.retry ?? true,
    staleTime: time.oneHour,
    enabled: !options?.disabled
  })
}
