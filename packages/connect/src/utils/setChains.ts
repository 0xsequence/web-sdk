import { type Chain, type Transport } from 'viem'
import { type Config } from 'wagmi'

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
  // 1. Update transports mapping
  // We cast to 'any' to access the private '_internal' property
  if (transports) {
    const internalConfig = config as any
    for (const chain of chains) {
      const transport = transports[chain.id]
      if (transport) {
        internalConfig._internal.transports[chain.id] = transport
      }
    }
  }

  // 2. Update chains state
  // This will trigger subscribers (like WagmiProvider and hooks) to re-render
  ;(config as any)._internal.chains.setState(chains)
}
