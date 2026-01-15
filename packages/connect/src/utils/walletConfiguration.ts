import { WALLET_CONFIGURATION_TIMEOUT_MS } from '../constants.js'
import type { ConnectConfig } from '../types.js'

export type WalletConfigurationProvider = 'EMAIL' | 'GOOGLE' | 'APPLE' | 'PASSKEY'

type WalletConfigurationMetaTags = {
  title?: string
  description?: string
  url?: string
  previewImage?: string
  favicon?: string
}

type WalletConfigurationThemeAsset = {
  src?: string | null
  width?: string | null
  height?: string | null
  alt?: string | null
}

type WalletConfigurationTheme = {
  fileHeaderLogo?: WalletConfigurationThemeAsset
  fileAuthLogo?: WalletConfigurationThemeAsset
  fileAuthCover?: WalletConfigurationThemeAsset
  fileBackgroundImage?: WalletConfigurationThemeAsset
}

type WalletConfigurationResponse = {
  name?: string
  description?: string
  url?: string
  metaTags?: WalletConfigurationMetaTags
  defaultTheme?: string
  themes?: Record<string, WalletConfigurationTheme>
  enabledProviders?: string[]
  supportedChains?: number[]
}

export type WalletConfigurationOverrides = {
  signIn?: {
    projectName?: string
    logoUrl?: string
  }
  chainIds?: number[]
  defaultChainId?: number
  enabledProviders?: WalletConfigurationProvider[]
}

type CachedWalletConfiguration = {
  data: WalletConfigurationResponse
  expiresAt: number
}

const CACHE_TTL_MS = 1000 * 60 * 60 * 4
const allowedProviders: WalletConfigurationProvider[] = ['EMAIL', 'GOOGLE', 'APPLE', 'PASSKEY']
const walletConfigurationPromises = new Map<string, Promise<WalletConfigurationResponse>>()
const walletConfigurationCache = new Map<string, CachedWalletConfiguration>()
const PROJECT_NAME_CACHE_KEY_PREFIX = '@0xsequence.wallet-config.projectName:'

export const normalizeWalletUrl = (walletUrl: string): string => {
  const trimmed = walletUrl.trim()
  if (!trimmed) {
    return ''
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  return withProtocol.replace(/\/+$/, '')
}

const getCachedWalletConfiguration = (normalizedUrl: string): WalletConfigurationResponse | undefined => {
  const cached = walletConfigurationCache.get(normalizedUrl)

  if (!cached) {
    return undefined
  }

  if (Date.now() > cached.expiresAt) {
    walletConfigurationCache.delete(normalizedUrl)
    return undefined
  }

  return cached.data
}

export const fetchWalletConfiguration = async (walletUrl: string): Promise<WalletConfigurationResponse> => {
  const normalizedUrl = normalizeWalletUrl(walletUrl)

  if (!normalizedUrl) {
    throw new Error('walletUrl is required to fetch wallet configuration')
  }

  const cached = getCachedWalletConfiguration(normalizedUrl)
  if (cached) {
    return cached
  }

  if (walletConfigurationPromises.has(normalizedUrl)) {
    return walletConfigurationPromises.get(normalizedUrl)!
  }

  const request = (async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WALLET_CONFIGURATION_TIMEOUT_MS)

    try {
      const response = await fetch(`${normalizedUrl}/api/wallet-configuration`, {
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch wallet configuration: ${response.statusText}`)
      }

      const result = (await response.json()) as WalletConfigurationResponse
      walletConfigurationCache.set(normalizedUrl, { data: result, expiresAt: Date.now() + CACHE_TTL_MS })
      return result
    } catch (error) {
      if ((error as Error | undefined)?.name === 'AbortError') {
        throw new Error('Wallet configuration request was cancelled')
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
      walletConfigurationPromises.delete(normalizedUrl)
    }
  })()

  walletConfigurationPromises.set(normalizedUrl, request)
  return request
}

const pickLogoUrl = (config: WalletConfigurationResponse): string | undefined => {
  const themes = config.themes || {}

  const themeOrder = [config.defaultTheme?.toLowerCase(), ...Object.keys(themes).map(theme => theme.toLowerCase())].filter(
    Boolean
  ) as string[]

  const getLogoFromTheme = (theme?: WalletConfigurationTheme) => {
    return theme?.fileAuthLogo?.src
  }

  for (const themeKey of themeOrder) {
    const logo = getLogoFromTheme(themes[themeKey])
    if (logo) {
      return logo
    }
  }

  return config.metaTags?.previewImage || config.metaTags?.favicon
}

const normalizeEnabledProviders = (providers?: string[]): WalletConfigurationProvider[] | undefined => {
  if (!Array.isArray(providers)) {
    return undefined
  }

  const normalized = providers
    .map(p => (typeof p === 'string' ? p.toUpperCase() : ''))
    .filter((p): p is WalletConfigurationProvider => allowedProviders.includes(p as WalletConfigurationProvider))

  return normalized
}

const buildProjectNameCacheKey = (normalizedUrl: string) => `${PROJECT_NAME_CACHE_KEY_PREFIX}${normalizedUrl}`

export const getCachedProjectName = (walletUrl: string): string | undefined => {
  const normalizedUrl = normalizeWalletUrl(walletUrl)
  if (!normalizedUrl) {
    return undefined
  }
  try {
    const cached = localStorage.getItem(buildProjectNameCacheKey(normalizedUrl))
    return cached || undefined
  } catch {
    return undefined
  }
}

export const cacheProjectName = (walletUrl: string, projectName: string) => {
  const normalizedUrl = normalizeWalletUrl(walletUrl)
  if (!normalizedUrl || !projectName) {
    return
  }
  try {
    localStorage.setItem(buildProjectNameCacheKey(normalizedUrl), projectName)
  } catch {
    // ignore storage failures
  }
}

export const mapWalletConfigurationToOverrides = (config: WalletConfigurationResponse): WalletConfigurationOverrides => {
  const projectName = typeof config.name === 'string' && config.name.trim() ? config.name : undefined
  const logoUrl = pickLogoUrl(config)

  const chainIds = Array.isArray(config.supportedChains) && config.supportedChains.length > 0 ? config.supportedChains : undefined
  const defaultChainId = chainIds?.[0]

  const enabledProviders = normalizeEnabledProviders(config.enabledProviders)

  return {
    signIn:
      projectName || logoUrl
        ? {
            projectName,
            logoUrl
          }
        : undefined,
    chainIds,
    defaultChainId,
    enabledProviders
  }
}

export const mergeConnectConfigWithWalletConfiguration = (
  config: ConnectConfig,
  overrides?: WalletConfigurationOverrides
): ConnectConfig => {
  if (!overrides) {
    return config
  }

  const mergedConfig: ConnectConfig = {
    ...config
  }

  if (overrides.chainIds !== undefined) {
    mergedConfig.chainIds = overrides.chainIds
  }

  if (overrides.defaultChainId !== undefined && mergedConfig.defaultChainId === undefined) {
    mergedConfig.defaultChainId = overrides.defaultChainId
  }

  return mergedConfig
}
