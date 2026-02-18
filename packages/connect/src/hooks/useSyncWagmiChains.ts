import { useEffect, useRef } from 'react'
import { type Chain, type Transport } from 'viem'
import { type Config, type Connector } from 'wagmi'

import { getDefaultChains } from '../config/defaultChains.js'
import { getDefaultTransports } from '../config/defaultTransports.js'
import type { ConnectConfig } from '../types.js'
import { setChains } from '../utils/setChains.js'

const haveSameChainIds = (current: readonly Chain[], next: readonly Chain[]) => {
  if (current.length !== next.length) {
    return false
  }

  return current.every((chain, index) => chain.id === next[index]?.id)
}

export const useSyncWagmiChains = (config: ConnectConfig, wagmiConfig: Config) => {
  const initialChainsRef = useRef<readonly [Chain, ...Chain[]] | undefined>(undefined)
  const initialTransportsRef = useRef<Record<number, Transport> | undefined>(undefined)
  const lastAppliedChainIdRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const chainState = ((wagmiConfig as any)._internal?.chains?.getState?.() ?? wagmiConfig.chains) as readonly [
      Chain,
      ...Chain[]
    ]
    initialChainsRef.current = chainState

    const transports = ((wagmiConfig as any)._internal?.transports ?? {}) as Record<number, Transport>
    initialTransportsRef.current = transports
  }, [wagmiConfig])

  useEffect(() => {
    const initialChains = initialChainsRef.current
    if (!initialChains) {
      return
    }

    const chainIds = Array.isArray(config.chainIds) && config.chainIds.length > 0 ? config.chainIds : undefined
    const nextChains = chainIds ? getDefaultChains(chainIds) : initialChains

    const chainStore = (wagmiConfig as any)._internal?.chains
    const currentChains = (chainStore?.getState?.() ?? wagmiConfig.chains) as readonly Chain[]

    if (haveSameChainIds(currentChains, nextChains)) {
      return
    }

    const currentTransports =
      ((wagmiConfig as any)._internal?.transports as Record<number, Transport> | undefined) || initialTransportsRef.current || {}
    const transports = {
      ...getDefaultTransports(nextChains, config.projectAccessKey),
      ...currentTransports
    }

    setChains(wagmiConfig, {
      chains: nextChains,
      transports
    })
  }, [config.chainIds, config.projectAccessKey, wagmiConfig])

  useEffect(() => {
    const hasConfiguredChains = Array.isArray(config.chainIds) && config.chainIds.length > 0
    const fallbackChainId = hasConfiguredChains ? config.chainIds![0] : undefined
    const preferredChainId = config.defaultChainId ?? fallbackChainId
    if (!preferredChainId) {
      return
    }

    if (lastAppliedChainIdRef.current === preferredChainId) {
      return
    }

    const availableChains = ((wagmiConfig as any)._internal?.chains?.getState?.() ?? wagmiConfig.chains) as readonly Chain[]
    const targetChainId = availableChains.find(chain => chain.id === preferredChainId)?.id
    if (!targetChainId) {
      return
    }

    lastAppliedChainIdRef.current = targetChainId

    try {
      wagmiConfig.setState(state => ({ ...state, chainId: targetChainId }))
    } catch (error) {
      console.warn('[useSyncWagmiChains] Failed to update wagmi chainId state', error)
    }

    const connectors = wagmiConfig.connectors as readonly Connector[]
    const sequenceConnectors = connectors.filter(
      (connector): connector is Connector & { switchChain: (args: { chainId: number }) => Promise<unknown> } =>
        connector.type === 'sequence-v3-wallet' && typeof connector.switchChain === 'function'
    )

    sequenceConnectors.forEach(connector => {
      connector.switchChain?.({ chainId: targetChainId }).catch(error => {
        console.warn('[useSyncWagmiChains] Failed to apply target chain', error)
      })
    })
  }, [config.chainIds, config.defaultChainId, wagmiConfig])
}
