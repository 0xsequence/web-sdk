import { LocalStorageKey, useWallets, useWalletSettings, type ConnectedWallet } from '@0xsequence/connect'
import { Observable, observable } from 'micro-observables'
import { useConfig } from 'wagmi'

import { defaultFiatCurrency, type FiatCurrency } from '../constants/index.js'

interface MutableObservable<T> extends Observable<T> {
  set(value: T): void
}

export interface SettingsCollection {
  contractAddress: string
  chainId: number
  name: string
  logoURI: string
}

interface Settings {
  hideUnlistedTokens: boolean
  fiatCurrency: FiatCurrency
  selectedNetworks: number[]
  allNetworks: number[]
  selectedWallets: ConnectedWallet[]
  showCollections: boolean
  hideUnlistedTokensObservable: Observable<boolean>
  fiatCurrencyObservable: Observable<FiatCurrency>
  selectedNetworksObservable: Observable<number[]>
  selectedWalletsObservable: Observable<ConnectedWallet[]>
  showCollectionsObservable: Observable<boolean>
  setFiatCurrency: (newFiatCurrency: FiatCurrency) => void
  setHideUnlistedTokens: (newState: boolean) => void
  setSelectedWallets: (newWallets: ConnectedWallet[]) => void
  setSelectedNetworks: (newNetworks: number[]) => void
  setShowCollections: (newState: boolean) => void
}

type SettingsItems = {
  hideUnlistedTokensObservable: MutableObservable<boolean>
  fiatCurrencyObservable: MutableObservable<FiatCurrency>
  selectedWalletsObservable: MutableObservable<ConnectedWallet[]>
  selectedNetworksObservable: MutableObservable<number[]>
  showCollectionsObservable: MutableObservable<boolean>
}

let settingsObservables: SettingsItems | null = null

/**
 * Hook to manage wallet settings with persistent storage.
 * Provides access to and control over user preferences for the wallet interface.
 * Settings are stored in localStorage and persist across sessions.
 *
 * @returns {Settings} Object containing current settings and setter functions:
 * - `hideUnlistedTokens`: Whether to hide unverified tokens
 * - `fiatCurrency`: Selected fiat currency for value display (e.g., USD, EUR)
 * - `selectedNetworks`: Array of chain IDs for networks to display
 * - `setFiatCurrency`: Function to update fiat currency preference
 * - `setHideUnlistedTokens`: Function to toggle unlisted tokens visibility
 * - `setSelectedNetworks`: Function to update selected networks
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useSettings} for more detailed documentation.
 *
 * @example
 * ```tsx
 * // Basic usage in a component
 * function WalletView() {
 *   const {
 *     fiatCurrency,
 *     selectedNetworks,
 *   } = useSettings()
 *
 *   return (
 *     <div>
 *       <Text>Currency: {fiatCurrency.symbol}</Text>
 *     </div>
 *   )
 * } *
 */
export const useSettings = (): Settings => {
  const { readOnlyNetworks, displayedAssets } = useWalletSettings()
  const { chains } = useConfig()
  const { wallets: allWallets } = useWallets()

  const allNetworks = [
    ...new Set([...chains.map(chain => chain.id), ...(readOnlyNetworks || []), ...displayedAssets.map(asset => asset.chainId)])
  ]

  const getSettingsFromStorage = (): SettingsItems => {
    let hideUnlistedTokens = true
    let fiatCurrency = defaultFiatCurrency
    let selectedWallets: ConnectedWallet[] = allWallets
    let selectedNetworks: number[] = allNetworks
    let showCollections = false

    try {
      const settingsStorage = localStorage.getItem(LocalStorageKey.Settings)

      const settings = JSON.parse(settingsStorage || '{}')

      if (settings?.hideUnlistedTokens !== undefined) {
        hideUnlistedTokens = settings?.hideUnlistedTokens
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

        if (hasInvalidNetworks) {
          selectedNetworks = allNetworks
          localStorage.setItem(LocalStorageKey.Settings, JSON.stringify({ ...settings, selectedNetworks: allNetworks }))
        }
      }
      if (settings?.showCollections !== undefined) {
        showCollections = settings?.showCollections
      }
    } catch (e) {
      console.error(e, 'Failed to fetch settings')
    }

    return {
      hideUnlistedTokensObservable: observable(hideUnlistedTokens),
      fiatCurrencyObservable: observable(fiatCurrency),
      selectedWalletsObservable: observable(selectedWallets),
      selectedNetworksObservable: observable(selectedNetworks),
      showCollectionsObservable: observable(showCollections)
    }
  }

  const resetSettings = () => {
    if (settingsObservables) {
      const selectedWallets = settingsObservables.selectedWalletsObservable.get()

      const isPartialSelection = selectedWallets.length > 1 && selectedWallets.length !== allWallets.length
      const hasInvalidWallets =
        selectedWallets.some(wallet => !allWallets.some((w: ConnectedWallet) => w.address === wallet.address)) ||
        isPartialSelection

      if (hasInvalidWallets || !selectedWallets.length) {
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
    fiatCurrencyObservable,
    selectedWalletsObservable,
    selectedNetworksObservable,
    showCollectionsObservable
  } = settingsObservables

  const setHideUnlistedTokens = (newState: boolean) => {
    hideUnlistedTokensObservable.set(newState)
    updateLocalStorage()
  }

  const setFiatCurrency = (newFiatCurrency: FiatCurrency) => {
    fiatCurrencyObservable.set(newFiatCurrency)
    updateLocalStorage()
  }

  const setSelectedWallets = (newSelectedWallets: ConnectedWallet[]) => {
    if (newSelectedWallets.length === 0) {
      selectedWalletsObservable.set(allWallets)
    } else {
      selectedWalletsObservable.set(newSelectedWallets)
    }
    updateLocalStorage()
  }

  const setSelectedNetworks = (newSelectedNetworks: number[]) => {
    if (newSelectedNetworks.length === 0) {
      selectedNetworksObservable.set(allNetworks)
    } else {
      selectedNetworksObservable.set(newSelectedNetworks)
    }
    updateLocalStorage()
  }

  const setShowCollections = (newState: boolean) => {
    showCollectionsObservable.set(newState)
    updateLocalStorage()
  }

  const updateLocalStorage = () => {
    const newSettings = {
      hideUnlistedTokens: hideUnlistedTokensObservable.get(),
      fiatCurrency: fiatCurrencyObservable.get(),
      selectedWallets: selectedWalletsObservable.get(),
      selectedNetworks: selectedNetworksObservable.get(),
      showCollections: showCollectionsObservable.get()
    }
    console.log('settings updated', newSettings)
    localStorage.setItem(LocalStorageKey.Settings, JSON.stringify(newSettings))
  }

  return {
    hideUnlistedTokens: hideUnlistedTokensObservable.get(),
    fiatCurrency: fiatCurrencyObservable.get(),
    selectedWallets: selectedWalletsObservable.get(),
    selectedNetworks: selectedNetworksObservable.get(),
    allNetworks: allNetworks,
    showCollections: showCollectionsObservable.get(),
    hideUnlistedTokensObservable,
    fiatCurrencyObservable,
    selectedWalletsObservable,
    selectedNetworksObservable,
    showCollectionsObservable,
    setFiatCurrency,
    setHideUnlistedTokens,
    setSelectedWallets,
    setSelectedNetworks,
    setShowCollections
  }
}
