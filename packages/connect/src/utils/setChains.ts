import { type Chain, type Transport } from 'viem'
import { type Config } from 'wagmi'

import { WAGMI_MIN_TESTED_VERSION } from '../constants.js'

/**
 * Dynamically updates the chains and transports in a wagmi config at runtime.
 *
 * **Important**: This function accesses wagmi's internal `_internal` API which is
 * not part of the public interface. This was tested against wagmi v3.x and may
 * break in future wagmi versions if the internal structure changes.
 *
 * @param config - The wagmi Config instance to modify
 * @param options.chains - The new chain configuration (must have at least one chain)
 * @param options.transports - Optional transport overrides for specific chain IDs
 *
 * @throws Logs a warning and skips the update if the internal API structure is not as expected
 *
 * @see WAGMI_MIN_TESTED_VERSION for the minimum wagmi version this was tested against
 */
export function setChains(
  config: Config,
  {
    chains,
    transports
  }: {
    chains: readonly [Chain, ...Chain[]]
    transports?: Record<number, Transport>
  }
) {
  try {
    const internalConfig = config as any

    // Version guard: verify the internal API structure exists before accessing it
    if (!internalConfig._internal) {
      console.warn(
        `[setChains] wagmi config._internal not found. This utility requires wagmi >= ${WAGMI_MIN_TESTED_VERSION}. Chains were not updated.`
      )
      return
    }

    if (!internalConfig._internal.chains?.setState) {
      console.warn(
        `[setChains] wagmi config._internal.chains.setState not found. The wagmi internal API may have changed. Chains were not updated.`
      )
      return
    }

    // 1. Update transports mapping
    if (transports && internalConfig._internal.transports) {
      for (const chain of chains) {
        const transport = transports[chain.id]
        if (transport) {
          internalConfig._internal.transports[chain.id] = transport
        }
      }
    }

    // 2. Update chains state
    // This will trigger subscribers (like WagmiProvider and hooks) to re-render
    internalConfig._internal.chains.setState(chains)
  } catch (error) {
    console.warn('[setChains] Failed to update wagmi chains dynamically:', error)
  }
}
