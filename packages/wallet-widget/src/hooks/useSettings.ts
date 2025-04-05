import { ConnectedWallet, useWallets, LocalStorageKey, useWalletSettings } from '@0xsequence/connect'
import { Observable, observable } from 'micro-observables'
import { useConfig } from 'wagmi'

import { FiatCurrency, defaultFiatCurrency } from '../constants'

interface MutableObservable<T> extends Observable<T> {
  set(value: T): void
}

export interface SettingsCollection {
  contractAddress: string
  contractInfo: {
    name: string
    logoURI: string
  }
}

interface Settings {
  hideCollectibles: boolean
  hideUnlistedTokens: boolean
  fiatCurrency: FiatCurrency
  selectedNetworks: number[]
  allNetworks: number[]
  selectedWallets: ConnectedWallet[]
  selectedCollections: SettingsCollection[]
  hideCollectiblesObservable: Observable<boolean>
  hideUnlistedTokensObservable: Observable<boolean>
  fiatCurrencyObservable: Observable<FiatCurrency>
  selectedNetworksObservable: Observable<number[]>
  selectedWalletsObservable: Observable<ConnectedWallet[]>
  selectedCollectionsObservable: Observable<SettingsCollection[]>
  setFiatCurrency: (newFiatCurrency: FiatCurrency) => void
  setHideCollectibles: (newState: boolean) => void
  setHideUnlistedTokens: (newState: boolean) => void
  setSelectedWallets: (newWallets: ConnectedWallet[]) => void
  setSelectedNetworks: (newNetworks: number[]) => void
  setSelectedCollections: (newCollections: SettingsCollection[]) => void
}

type SettingsItems = {
  hideCollectiblesObservable: MutableObservable<boolean>
  hideUnlistedTokensObservable: MutableObservable<boolean>
  fiatCurrencyObservable: MutableObservable<FiatCurrency>
  selectedWalletsObservable: MutableObservable<ConnectedWallet[]>
  selectedNetworksObservable: MutableObservable<number[]>
  selectedCollectionsObservable: MutableObservable<SettingsCollection[]>
}

let settingsObservables: SettingsItems | null = null

export const useSettings = (): Settings => {
  const { readOnlyNetworks, displayedAssets } = useWalletSettings()
  const { chains } = useConfig()
  const { wallets: allWallets } = useWallets()

  const allNetworks = [
    ...new Set([...chains.map(chain => chain.id), ...(readOnlyNetworks || []), ...displayedAssets.map(asset => asset.chainId)])
  ]

  const getSettingsFromStorage = (): SettingsItems => {
    let hideUnlistedTokens = true
    let hideCollectibles = false
    let fiatCurrency = defaultFiatCurrency
    let selectedWallets: ConnectedWallet[] = allWallets
    let selectedNetworks: number[] = allNetworks
    let selectedCollections: SettingsCollection[] = []

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
      if (settings?.selectedWallets !== undefined) {
        selectedWallets = settings?.selectedWallets as ConnectedWallet[]

        const isPartialSelection = selectedWallets.length > 1 && selectedWallets.length !== allWallets.length
        const hasInvalidWallets =
          selectedWallets.some(wallet => !allWallets.some((w: ConnectedWallet) => w.address === wallet.address)) ||
          isPartialSelection

        if (hasInvalidWallets && allWallets.length !== 0) {
          selectedWallets = allWallets
          localStorage.setItem(LocalStorageKey.Settings, JSON.stringify({ ...settings, selectedWallets: allWallets }))
        }
      }
      if (settings?.selectedNetworks !== undefined) {
        selectedNetworks = settings?.selectedNetworks as number[]

        let hasInvalidNetworks = false
        settings.selectedNetworks.forEach((chainId: number) => {
          if (allNetworks.find(chain => chain === chainId) === undefined) {
            hasInvalidNetworks = true
          }
        })

        const hasInvalidNetworksSelection = selectedNetworks.length > 1 && selectedNetworks.length !== allNetworks.length

        if (hasInvalidNetworks || hasInvalidNetworksSelection) {
          selectedNetworks = allNetworks
          localStorage.setItem(LocalStorageKey.Settings, JSON.stringify({ ...settings, selectedNetworks: allNetworks }))
        }
      }
      if (settings?.selectedCollections !== undefined) {
        selectedCollections = settings?.selectedCollections
      }
    } catch (e) {
      console.error(e, 'Failed to fetch settings')
    }

    return {
      hideUnlistedTokensObservable: observable(hideUnlistedTokens),
      hideCollectiblesObservable: observable(hideCollectibles),
      fiatCurrencyObservable: observable(fiatCurrency),
      selectedWalletsObservable: observable(selectedWallets),
      selectedNetworksObservable: observable(selectedNetworks),
      selectedCollectionsObservable: observable(selectedCollections)
    }
  }

  const resetSettings = () => {
    if (settingsObservables) {
      const selectedWallets = settingsObservables.selectedWalletsObservable.get()
      const selectedNetworks = settingsObservables.selectedNetworksObservable.get()

      const isPartialSelection = selectedWallets.length > 1 && selectedWallets.length !== allWallets.length
      const hasInvalidWallets =
        selectedWallets.some(wallet => !allWallets.some((w: ConnectedWallet) => w.address === wallet.address)) ||
        isPartialSelection

      const hasInvalidNetworksSelection = selectedNetworks.length > 1 && selectedNetworks.length !== allNetworks.length

      if (hasInvalidWallets || hasInvalidNetworksSelection) {
        return true
      }
    }
    return false
  }

  if (!settingsObservables || resetSettings()) {
    settingsObservables = getSettingsFromStorage()
  }

  const {
    hideUnlistedTokensObservable,
    hideCollectiblesObservable,
    fiatCurrencyObservable,
    selectedWalletsObservable,
    selectedNetworksObservable,
    selectedCollectionsObservable
  } = settingsObservables

  const setHideUnlistedTokens = (newState: boolean) => {
    hideUnlistedTokensObservable.set(newState)
    updateLocalStorage()
  }

  const setHideCollectibles = (newState: boolean) => {
    hideCollectiblesObservable.set(newState)
    updateLocalStorage()
  }

  const setFiatCurrency = (newFiatCurrency: FiatCurrency) => {
    fiatCurrencyObservable.set(newFiatCurrency)
    updateLocalStorage()
  }

  const setSelectedWallets = (newSelectedWallets: ConnectedWallet[]) => {
    if (newSelectedWallets.length === 0) {
      selectedWalletsObservable.set(allWallets)
      updateLocalStorage()
    } else {
      selectedWalletsObservable.set(newSelectedWallets)
      updateLocalStorage()
    }
  }

  const setSelectedNetworks = (newSelectedNetworks: number[]) => {
    if (newSelectedNetworks.length === 0) {
      selectedNetworksObservable.set(allNetworks)
      updateLocalStorage()
    } else {
      selectedNetworksObservable.set(newSelectedNetworks)
      selectedCollectionsObservable.set([])
      updateLocalStorage()
    }
  }

  const setSelectedCollections = (newSelectedCollections: SettingsCollection[]) => {
    if (newSelectedCollections.length === 0) {
      selectedCollectionsObservable.set([])
      updateLocalStorage()
    } else {
      selectedCollectionsObservable.set(newSelectedCollections)
      updateLocalStorage()
    }
  }

  const updateLocalStorage = () => {
    const newSettings = {
      hideUnlistedTokens: hideUnlistedTokensObservable.get(),
      hideCollectibles: hideCollectiblesObservable.get(),
      fiatCurrency: fiatCurrencyObservable.get(),
      selectedWallets: selectedWalletsObservable.get(),
      selectedNetworks: selectedNetworksObservable.get(),
      selectedCollections: selectedCollectionsObservable.get()
    }
    console.log('settings updated', newSettings)
    localStorage.setItem(LocalStorageKey.Settings, JSON.stringify(newSettings))
  }

  return {
    hideUnlistedTokens: hideUnlistedTokensObservable.get(),
    hideCollectibles: hideCollectiblesObservable.get(),
    fiatCurrency: fiatCurrencyObservable.get(),
    selectedWallets: selectedWalletsObservable.get(),
    selectedNetworks: selectedNetworksObservable.get(),
    allNetworks: allNetworks,
    selectedCollections: selectedCollectionsObservable.get(),
    hideUnlistedTokensObservable,
    hideCollectiblesObservable,
    fiatCurrencyObservable,
    selectedWalletsObservable,
    selectedNetworksObservable,
    selectedCollectionsObservable,
    setFiatCurrency,
    setHideCollectibles,
    setHideUnlistedTokens,
    setSelectedWallets,
    setSelectedNetworks,
    setSelectedCollections
  }
}
