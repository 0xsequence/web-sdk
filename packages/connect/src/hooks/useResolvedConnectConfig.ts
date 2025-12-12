import { useEffect, useMemo, useState } from 'react'

import type { ConnectConfig } from '../types.js'
import {
  fetchWalletConfiguration,
  mapWalletConfigurationToOverrides,
  mergeConnectConfigWithWalletConfiguration,
  normalizeWalletUrl,
  type WalletConfigurationProvider
} from '../utils/walletConfiguration.js'

export const useResolvedConnectConfig = (config: ConnectConfig) => {
  const [resolvedConfig, setResolvedConfig] = useState<ConnectConfig>(config)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [enabledProviders, setEnabledProviders] = useState<WalletConfigurationProvider[] | undefined>(undefined)

  const normalizedWalletUrl = useMemo(() => {
    return config.walletUrl ? normalizeWalletUrl(config.walletUrl) : ''
  }, [config.walletUrl])

  useEffect(() => {
    setResolvedConfig(config)
    setEnabledProviders(undefined)
  }, [config])

  useEffect(() => {
    let cancelled = false

    if (!normalizedWalletUrl) {
      setResolvedConfig(config)
      setEnabledProviders(undefined)
      setIsLoading(false)
      return () => {
        cancelled = true
      }
    }

    setIsLoading(true)

    fetchWalletConfiguration(normalizedWalletUrl)
      .then(remoteConfig => {
        if (cancelled) {
          return
        }

        const overrides = mapWalletConfigurationToOverrides(remoteConfig)
        setEnabledProviders(overrides.enabledProviders)
        setResolvedConfig(mergeConnectConfigWithWalletConfiguration(config, overrides))
      })
      .catch(error => {
        if (!cancelled) {
          console.warn('Failed to fetch wallet configuration', error)
          setResolvedConfig(config)
          setEnabledProviders(undefined)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [normalizedWalletUrl, config])

  return useMemo(
    () => ({
      resolvedConfig,
      isLoading,
      enabledProviders
    }),
    [resolvedConfig, isLoading, enabledProviders]
  )
}
