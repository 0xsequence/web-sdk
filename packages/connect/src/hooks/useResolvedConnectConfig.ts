'use client'

import { useEffect, useMemo, useState } from 'react'

import type { ConnectConfig } from '../types.js'
import { checkAuthStatus } from '../utils/checkAuthStatus.js'
import {
  cacheProjectName,
  fetchWalletConfiguration,
  getCachedProjectName,
  mapWalletConfigurationToOverrides,
  mergeConnectConfigWithWalletConfiguration,
  normalizeWalletUrl,
  type WalletConfigurationOverrides,
  type WalletConfigurationProvider
} from '../utils/walletConfiguration.js'

export const useResolvedConnectConfig = (config: ConnectConfig) => {
  const [resolvedConfig, setResolvedConfig] = useState<ConnectConfig>(config)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [enabledProviders, setEnabledProviders] = useState<WalletConfigurationProvider[] | undefined>(undefined)
  const [walletConfigurationSignIn, setWalletConfigurationSignIn] = useState<WalletConfigurationOverrides['signIn']>()
  const [isV3WalletSignedIn, setIsV3WalletSignedIn] = useState<boolean | null>(null)
  const [isAuthStatusLoading, setIsAuthStatusLoading] = useState<boolean>(false)

  const normalizedWalletUrl = useMemo(() => {
    return config.walletUrl ? normalizeWalletUrl(config.walletUrl) : ''
  }, [config.walletUrl])

  useEffect(() => {
    setResolvedConfig(config)
    setEnabledProviders(undefined)
    setWalletConfigurationSignIn(undefined)
    setIsV3WalletSignedIn(null)
    setIsAuthStatusLoading(false)
  }, [config])

  useEffect(() => {
    let cancelled = false

    const cachedProjectName = normalizedWalletUrl ? getCachedProjectName(normalizedWalletUrl) : undefined
    const cachedSignIn = cachedProjectName ? { projectName: cachedProjectName } : undefined

    if (!normalizedWalletUrl) {
      setResolvedConfig(config)
      setEnabledProviders(undefined)
      setWalletConfigurationSignIn(undefined)
      setIsV3WalletSignedIn(null)
      setIsLoading(false)
      setIsAuthStatusLoading(false)
      return () => {
        cancelled = true
      }
    }

    setResolvedConfig(config)
    setWalletConfigurationSignIn(cachedSignIn)
    setIsLoading(true)
    setIsAuthStatusLoading(true)

    checkAuthStatus(normalizedWalletUrl)
      .then(signedIn => {
        if (!cancelled) {
          setIsV3WalletSignedIn(signedIn)
        }
      })
      .catch(error => {
        if (!cancelled) {
          console.warn('Failed to check auth status', error)
          setIsV3WalletSignedIn(false)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsAuthStatusLoading(false)
        }
      })

    fetchWalletConfiguration(normalizedWalletUrl)
      .then(remoteConfig => {
        if (cancelled) {
          return
        }

        const overrides = mapWalletConfigurationToOverrides(remoteConfig)
        setEnabledProviders(overrides.enabledProviders)
        setWalletConfigurationSignIn(overrides.signIn)
        setResolvedConfig(mergeConnectConfigWithWalletConfiguration(config, overrides))
        if (overrides.signIn?.projectName) {
          cacheProjectName(normalizedWalletUrl, overrides.signIn.projectName)
        }
      })
      .catch(error => {
        if (!cancelled) {
          console.warn('Failed to fetch wallet configuration', error)
          setResolvedConfig(config)
          setEnabledProviders(undefined)
          setWalletConfigurationSignIn(cachedSignIn)
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
      enabledProviders,
      walletConfigurationSignIn,
      isV3WalletSignedIn,
      isAuthStatusLoading
    }),
    [resolvedConfig, isLoading, enabledProviders, walletConfigurationSignIn, isV3WalletSignedIn, isAuthStatusLoading]
  )
}
