'use client'

import { useEffect, useMemo, useState } from 'react'

import type { ConnectConfig } from '../types.js'
import { checkAuthStatus } from '../utils/checkAuthStatus.js'
import {
  cacheProjectName,
  fetchWalletConfiguration,
  getCachedProjectName,
  getCachedWalletConfiguration,
  mapWalletConfigurationToOverrides,
  mergeConnectConfigWithWalletConfiguration,
  normalizeWalletUrl,
  type WalletConfigurationOverrides,
  type WalletConfigurationProvider
} from '../utils/walletConfiguration.js'

const getInitialCachedState = (config: ConnectConfig) => {
  if (!config.walletUrl) {
    return {
      resolvedConfig: config,
      enabledProviders: undefined,
      walletConfigurationSignIn: undefined
    }
  }

  const normalizedWalletUrl = normalizeWalletUrl(config.walletUrl)
  if (!normalizedWalletUrl) {
    return {
      resolvedConfig: config,
      enabledProviders: undefined,
      walletConfigurationSignIn: undefined
    }
  }

  const cachedProjectName = getCachedProjectName(normalizedWalletUrl)
  const cachedWalletConfiguration = getCachedWalletConfiguration(normalizedWalletUrl)
  const cachedOverrides = cachedWalletConfiguration ? mapWalletConfigurationToOverrides(cachedWalletConfiguration) : undefined
  const walletConfigurationSignIn =
    cachedOverrides?.signIn || (cachedProjectName ? { projectName: cachedProjectName } : undefined)

  return {
    resolvedConfig: cachedOverrides ? mergeConnectConfigWithWalletConfiguration(config, cachedOverrides) : config,
    enabledProviders: cachedOverrides?.enabledProviders,
    walletConfigurationSignIn
  }
}

const areOverridesEqual = (left: WalletConfigurationOverrides | undefined, right: WalletConfigurationOverrides | undefined) => {
  if (!left && !right) {
    return true
  }

  if (!left || !right) {
    return false
  }

  const leftChainIds = left.chainIds
  const rightChainIds = right.chainIds
  if (leftChainIds || rightChainIds) {
    if (!leftChainIds || !rightChainIds || leftChainIds.length !== rightChainIds.length) {
      return false
    }
    for (let index = 0; index < leftChainIds.length; index += 1) {
      if (leftChainIds[index] !== rightChainIds[index]) {
        return false
      }
    }
  }

  if (left.defaultChainId !== right.defaultChainId) {
    return false
  }

  const leftProviders = left.enabledProviders
  const rightProviders = right.enabledProviders
  if (leftProviders || rightProviders) {
    if (!leftProviders || !rightProviders || leftProviders.length !== rightProviders.length) {
      return false
    }
    for (let index = 0; index < leftProviders.length; index += 1) {
      if (leftProviders[index] !== rightProviders[index]) {
        return false
      }
    }
  }

  const leftSignIn = left.signIn
  const rightSignIn = right.signIn
  if (leftSignIn || rightSignIn) {
    if (!leftSignIn || !rightSignIn) {
      return false
    }
    if (leftSignIn.projectName !== rightSignIn.projectName || leftSignIn.logoUrl !== rightSignIn.logoUrl) {
      return false
    }
  }

  return true
}

export const useResolvedConnectConfig = (config: ConnectConfig) => {
  const initialCachedState = getInitialCachedState(config)
  const [resolvedConfig, setResolvedConfig] = useState<ConnectConfig>(initialCachedState.resolvedConfig)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [enabledProviders, setEnabledProviders] = useState<WalletConfigurationProvider[] | undefined>(
    initialCachedState.enabledProviders
  )
  const [walletConfigurationSignIn, setWalletConfigurationSignIn] = useState<WalletConfigurationOverrides['signIn']>(
    initialCachedState.walletConfigurationSignIn
  )
  const [isV3WalletSignedIn, setIsV3WalletSignedIn] = useState<boolean | null>(null)
  const [isAuthStatusLoading, setIsAuthStatusLoading] = useState<boolean>(false)

  const normalizedWalletUrl = useMemo(() => {
    return config.walletUrl ? normalizeWalletUrl(config.walletUrl) : ''
  }, [config.walletUrl])

  useEffect(() => {
    const cachedState = getInitialCachedState(config)
    setResolvedConfig(cachedState.resolvedConfig)
    setEnabledProviders(cachedState.enabledProviders)
    setWalletConfigurationSignIn(cachedState.walletConfigurationSignIn)
    setIsV3WalletSignedIn(null)
    setIsAuthStatusLoading(false)
  }, [config])

  useEffect(() => {
    let cancelled = false

    const cachedProjectName = normalizedWalletUrl ? getCachedProjectName(normalizedWalletUrl) : undefined
    const cachedWalletConfiguration = normalizedWalletUrl ? getCachedWalletConfiguration(normalizedWalletUrl) : undefined
    const cachedOverrides = cachedWalletConfiguration ? mapWalletConfigurationToOverrides(cachedWalletConfiguration) : undefined
    const cachedSignIn = cachedOverrides?.signIn || (cachedProjectName ? { projectName: cachedProjectName } : undefined)

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

    setResolvedConfig(cachedOverrides ? mergeConnectConfigWithWalletConfiguration(config, cachedOverrides) : config)
    setEnabledProviders(cachedOverrides?.enabledProviders)
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

    fetchWalletConfiguration(normalizedWalletUrl, { force: Boolean(cachedWalletConfiguration) })
      .then(remoteConfig => {
        if (cancelled) {
          return
        }

        const overrides = mapWalletConfigurationToOverrides(remoteConfig)
        if (!areOverridesEqual(cachedOverrides, overrides)) {
          setEnabledProviders(overrides.enabledProviders)
          setWalletConfigurationSignIn(overrides.signIn)
          setResolvedConfig(mergeConnectConfigWithWalletConfiguration(config, overrides))
        }
        if (overrides.signIn?.projectName) {
          cacheProjectName(normalizedWalletUrl, overrides.signIn.projectName)
        }
      })
      .catch(error => {
        if (!cancelled) {
          console.warn('Failed to fetch wallet configuration', error)
          setResolvedConfig(cachedOverrides ? mergeConnectConfigWithWalletConfiguration(config, cachedOverrides) : config)
          setEnabledProviders(cachedOverrides?.enabledProviders)
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
