import { useWalletConfigContext } from '../contexts/WalletConfig'

/**
 * Hook to access and modify wallet configuration settings.
 *
 * This hook provides access to wallet settings including:
 * - Displayed assets configuration (which tokens/contracts to show)
 * - Read-only networks (networks where transactions are disabled)
 * - See if external wallets are visible on the Connect Modal
 * - See if linked wallets are visible on the Connect Modal
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useWalletSettings} for more detailed documentation.
 *
 * @returns An object containing:
 * - `displayedAssets` - Array of assets to display, each with a contract address and chain ID
 * - `readOnlyNetworks` - Array of network IDs where transactions are disabled
 * - `setDisplayedAssets` - Function to update the list of displayed assets
 * - `hideExternalConnectOptions` - Hide external wallets on the Connect Modal
 * - `hideConnectedWallets` - Hide connected wallets on the Connect Modal
 * - `hideSocialConnectOptions` - Hide social wallets on the Connect Modal
 *
 * @example
 * ```tsx
 * const { displayedAssets, readOnlyNetworks, setDisplayedAssets, hideExternalConnectOptions, hideConnectedWallets, hideSocialConnectOptions } = useWalletSettings()
 *
 * // Check if a network is read-only
 * const isReadOnly = readOnlyNetworks?.includes(1) // true if Ethereum mainnet is read-only
 *
 * // Update displayed assets
 * setDisplayedAssets([
 *   { contractAddress: '0x...', chainId: 1 }, // ETH mainnet token
 *   { contractAddress: '0x...', chainId: 137 } // Polygon token
 * ])
 * ```
 */
export const useWalletSettings = () => {
  const {
    setDisplayedAssets,
    displayedAssets,
    readOnlyNetworks,
    hideExternalConnectOptions,
    hideConnectedWallets,
    hideSocialConnectOptions
  } = useWalletConfigContext()

  return {
    displayedAssets,
    readOnlyNetworks,
    setDisplayedAssets,
    hideExternalConnectOptions,
    hideConnectedWallets,
    hideSocialConnectOptions
  }
}
