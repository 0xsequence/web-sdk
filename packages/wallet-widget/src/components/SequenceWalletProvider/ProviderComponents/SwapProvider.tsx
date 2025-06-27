import type { Token } from '@0xsequence/api'
import { useWalletSettings } from '@0xsequence/connect'
import { useAPIClient } from '@0xsequence/hooks'
import type { ChainId } from '@0xsequence/network'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useChains } from 'wagmi'

import { SwapContextProvider } from '../../../contexts/Swap.js'

export const SwapProvider = ({ children }: { children: ReactNode }) => {
  const apiClient = useAPIClient()
  const chains = useChains()

  const [lifiChains, setLifiChains] = useState<ChainId[]>([])
  const [lifiTokens, setLifiTokens] = useState<Token[]>([])

  const { readOnlyNetworks, displayedAssets } = useWalletSettings()

  const allNetworks = useMemo(
    () => [
      ...new Set([...chains.map(chain => chain.id), ...(readOnlyNetworks || []), ...displayedAssets.map(asset => asset.chainId)])
    ],
    [chains, readOnlyNetworks, displayedAssets]
  )

  useEffect(() => {
    const fetchLifiChains = async () => {
      const lifiSupportedChains = await apiClient.getLifiChains()
      const supportedChains = lifiSupportedChains.chains.filter(chain => allNetworks.includes(chain))
      setLifiChains(supportedChains)
    }
    fetchLifiChains()
  }, [apiClient, allNetworks])

  useEffect(() => {
    const fetchLifiTokens = async () => {
      if (lifiChains.length > 0) {
        const tokens = await apiClient.getLifiTokens({ chainIds: lifiChains })
        setLifiTokens(tokens.tokens)
      }
    }
    fetchLifiTokens()
  }, [apiClient, lifiChains])

  return (
    <SwapContextProvider
      value={{
        lifiChains,
        lifiTokens
      }}
    >
      {children}
    </SwapContextProvider>
  )
}
