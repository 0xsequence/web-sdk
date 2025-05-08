import { useChainId, useChains } from 'wagmi'
import type { Chain } from 'wagmi/chains'

/**
 * Hook for retrieving chain configuration information from wagmi's chain configurations
 *
 * This hook provides functionality to:
 * - Get the configuration for the currently connected chain
 * - Get the configuration for a specific chain by ID
 * - Access chain-specific details like name, network configuration, RPC URLs, and block explorers
 *
 * The hook is commonly used in conjunction with other Sequence hooks to access chain-specific
 * information when working with transactions, indexer clients, or network-specific features.
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useChain} for more detailed documentation.
 *
 * @param chainId - Optional chain ID to get configuration for a specific chain. If not provided, returns the current chain's configuration.
 * @returns Chain configuration object for the specified or current chain, or undefined if not found
 *
 * @example
 * ```tsx
 * // Get current chain configuration
 * const currentChain = useChain();
 * console.log('Current chain name:', currentChain?.name);
 *
 * // Get configuration for a specific chain
 * const ethereumChain = useChain(1); // Ethereum Mainnet
 * console.log('Ethereum chain details:', ethereumChain);
 * ```
 */
export const useChain = (chainId?: number): Chain | undefined => {
  const chains = useChains()
  const currentChainId = useChainId()

  return chains.find(chain => (chainId ? chain.id === chainId : chain.id === currentChainId))
}
