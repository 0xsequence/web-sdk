import { LocalStorageKey, useWalletSettings } from '@0xsequence/react-connect'
import { useState } from 'react'
import { useConfig } from 'wagmi'

import { FiatCurrency, defaultFiatCurrency } from '../constants'

interface Settings {
  hideCollectibles: boolean
  hideUnlistedTokens: boolean
  fiatCurrency: FiatCurrency
  selectedNetworks: number[]
  setFiatCurrency: (newFiatCurrency: FiatCurrency) => void
  setHideCollectibles: (newState: boolean) => void
  setHideUnlistedTokens: (newState: boolean) => void
  setSelectedNetworks: (newNetworks: number[]) => void
}

type SettingsItems = Pick<Settings, 'hideCollectibles' | 'hideUnlistedTokens' | 'fiatCurrency' | 'selectedNetworks'>

export const useSettings = (): Settings => {
  const { readOnlyNetworks, displayedAssets } = useWalletSettings()
  const { chains } = useConfig()

  const allChains = [
    ...new Set([...chains.map(chain => chain.id), ...(readOnlyNetworks || []), ...displayedAssets.map(asset => asset.chainId)])
  ]

  const getSettingsFromStorage = (): SettingsItems => {
    let hideUnlistedTokens = true
    let hideCollectibles = false
    let fiatCurrency = defaultFiatCurrency
    let selectedNetworks = allChains

    try {
      const settingsStorage = localStorage.getItem(LocalStorageKey.Settings)

      const settings = JSON.parse(settingsStorage || '{}')
      if (settings?.hideUnlistedTokens !== undefined) {
        hideUnlistedTokens = settings?.hideUnlistedTokens
      }
      if (settings?.hideCollectibles !== undefined) {
        hideCollectibles = settings?.hideCollectibles
      }
      if (settings?.fiatCurrency !== undefined) {
        fiatCurrency = settings?.fiatCurrency as FiatCurrency
      }

      if (settings?.selectedNetworks !== undefined) {
        let areSelectedNetworksValid = true
        settings.selectedNetworks.forEach((chainId: number) => {
          if (allChains.find(chain => chain === chainId) === undefined) {
            areSelectedNetworksValid = false
          }
        })
        if (areSelectedNetworksValid) {
          selectedNetworks = settings?.selectedNetworks as number[]
        }
      }
    } catch (e) {
      console.error(e, 'Failed to fetch settings')
    }

    return {
      hideUnlistedTokens,
      hideCollectibles,
      fiatCurrency,
      selectedNetworks
    }
  }
  const defaultSettings = getSettingsFromStorage()

  const [settings, setSettings] = useState(defaultSettings)

  const setHideUnlistedTokens = (newState: boolean) => {
    const oldSettings = getSettingsFromStorage()
    const newSettings = {
      ...oldSettings,
      hideUnlistedTokens: newState
    }
    localStorage.setItem(LocalStorageKey.Settings, JSON.stringify(newSettings))
    setSettings(newSettings)
  }

  const setHideCollectibles = (newState: boolean) => {
    const oldSettings = getSettingsFromStorage()
    const newSettings = {
      ...oldSettings,
      hideCollectibles: newState
    }
    localStorage.setItem(LocalStorageKey.Settings, JSON.stringify(newSettings))
    setSettings(newSettings)
  }

  const setFiatCurrency = (newFiatCurrency: FiatCurrency) => {
    const oldSettings = getSettingsFromStorage()
    const newSettings = {
      ...oldSettings,
      fiatCurrency: newFiatCurrency
    }
    localStorage.setItem(LocalStorageKey.Settings, JSON.stringify(newSettings))
    setSettings(newSettings)
  }

  const setSelectedNetworks = (newSelectedNetworks: number[]) => {
    const oldSettings = getSettingsFromStorage()
    const newSettings = {
      ...oldSettings,
      selectedNetworks: newSelectedNetworks
    }
    localStorage.setItem(LocalStorageKey.Settings, JSON.stringify(newSettings))
    setSettings(newSettings)
  }

  return {
    ...settings,
    setFiatCurrency,
    setHideCollectibles,
    setHideUnlistedTokens,
    setSelectedNetworks
  }
}
