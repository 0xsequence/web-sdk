import { Navigation } from '../../../contexts'
import {
  CoinDetails,
  CollectibleDetails,
  CollectionDetails,
  Home,
  Receive,
  SendCoin,
  SendCollectible,
  History,
  SearchWallet,
  SearchWalletViewAll,
  LegacySettingsMenu,
  LegacySettingsCurrency,
  LegacySettingsNetwork,
  LegacySettingsGeneral,
  TransactionDetails,
  SwapCoin,
  SwapList,
  SearchTokens,
  SearchCollectibles
} from '../../../views'
import { SendGeneral } from '../../../views/SendGeneral'
import { SettingsWallets } from '../../../views/Settings'
import { SettingsApps } from '../../../views/Settings/Apps'
import { SettingsCurrency } from '../../../views/Settings/Currency'
import { SettingsMenu } from '../../../views/Settings/Menu'
import { SettingsNetworks } from '../../../views/Settings/Networks'
import { SettingsPreferences } from '../../../views/Settings/Preferences'
import { SettingsProfiles } from '../../../views/Settings/Profiles'
import { QrScan } from '../../../views/Settings/QrScan'
import { Swap } from '../../../views/Swap'
import { NavigationHeader } from '../../NavigationHeader'
import { WalletHeader } from '../../WalletHeader'

export const getContent = (navigation: Navigation) => {
  const { location } = navigation

  switch (location) {
    case 'send-general':
      return <SendGeneral />
    case 'send-coin':
      return <SendCoin chainId={navigation.params.chainId} contractAddress={navigation.params.contractAddress} />
    case 'send-collectible':
      return (
        <SendCollectible
          chainId={navigation.params.chainId}
          contractAddress={navigation.params.contractAddress}
          tokenId={navigation.params.tokenId}
        />
      )
    case 'swap':
      return <Swap />
    case 'receive':
      return <Receive />
    case 'history':
      return <History />
    case 'search':
      return <SearchWallet />
    case 'search-view-all':
      return <SearchWalletViewAll defaultTab={navigation.params.defaultTab} />
    case 'search-tokens':
      return <SearchTokens />
    case 'search-collectibles':
      return <SearchCollectibles />
    case 'settings':
      return <SettingsMenu />
    case 'settings-wallets':
      return <SettingsWallets />
    case 'settings-networks':
      return <SettingsNetworks />
    case 'settings-currency':
      return <SettingsCurrency />
    case 'settings-profiles':
      return <SettingsProfiles />
    case 'settings-preferences':
      return <SettingsPreferences />
    case 'settings-apps':
      return <SettingsApps />
    case 'connect-dapp':
      return <QrScan />
    case 'legacy-settings':
      return <LegacySettingsMenu />
    case 'legacy-settings-general':
      return <LegacySettingsGeneral />
    case 'legacy-settings-currency':
      return <LegacySettingsCurrency />
    case 'legacy-settings-networks':
      return <LegacySettingsNetwork />
    case 'coin-details':
      return (
        <CoinDetails
          contractAddress={navigation.params.contractAddress}
          chainId={navigation.params.chainId}
          accountAddress={navigation.params.accountAddress}
        />
      )

    case 'collectible-details':
      return (
        <CollectibleDetails
          contractAddress={navigation.params.contractAddress}
          chainId={navigation.params.chainId}
          tokenId={navigation.params.tokenId}
          accountAddress={navigation.params.accountAddress}
        />
      )
    case 'collection-details':
      return <CollectionDetails contractAddress={navigation.params.contractAddress} chainId={navigation.params.chainId} />
    case 'transaction-details':
      return <TransactionDetails transaction={navigation.params.transaction} />
    case 'swap-coin':
      return <SwapCoin contractAddress={navigation.params.contractAddress} chainId={navigation.params.chainId} />
    case 'swap-coin-list':
      return (
        <SwapList
          contractAddress={navigation.params.contractAddress}
          chainId={navigation.params.chainId}
          amount={navigation.params.amount}
        />
      )
    case 'home':
    default:
      return <Home />
  }
}

export const getHeader = (navigation: Navigation) => {
  const { location } = navigation
  switch (location) {
    case 'search':
      return <NavigationHeader primaryText="Search wallet" />
    case 'search-view-all':
      return <NavigationHeader secondaryText="Search wallet / " primaryText="View all" />
    case 'search-tokens':
      return <NavigationHeader primaryText="Tokens" />
    case 'search-collectibles':
      return <NavigationHeader primaryText="Collectibles" />
    case 'legacy-settings':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Settings" />
    case 'legacy-settings-general':
      return <NavigationHeader secondaryText="Wallet / Settings / " primaryText="General" />
    case 'legacy-settings-currency':
      return <NavigationHeader secondaryText="Wallet / Settings / " primaryText="Currency" />
    case 'legacy-settings-networks':
      return <NavigationHeader secondaryText="Wallet / Settings / " primaryText="Networks" />
    case 'settings':
      return <NavigationHeader primaryText="Settings" />
    case 'settings-wallets':
      return <NavigationHeader primaryText="Wallets" />
    case 'settings-networks':
      return <NavigationHeader primaryText="Networks" />
    case 'settings-currency':
      return <NavigationHeader primaryText="Currency" />
    case 'settings-profiles':
      return <NavigationHeader primaryText="Profiles" />
    case 'settings-preferences':
      return <NavigationHeader primaryText="Preferences" />
    case 'settings-apps':
      return <NavigationHeader primaryText="Apps" />
    case 'connect-dapp':
      return <NavigationHeader primaryText="Connect an App" />
    case 'history':
      return <NavigationHeader primaryText="Transaction History" />
    case 'coin-details':
      return <WalletHeader />
    case 'collectible-details':
      return <WalletHeader />
    case 'transaction-details':
      return <NavigationHeader secondaryText="" primaryText="" />
    case 'send-general':
      return <WalletHeader label="Send" />
    case 'send-coin':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Send Coin" />
    case 'send-collectible':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Send Collectible" />
    case 'swap':
      return <WalletHeader label="Swap" />
    case 'swap-coin':
    case 'swap-coin-list':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Buy" />
    case 'receive':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Receive" />
  }
}
