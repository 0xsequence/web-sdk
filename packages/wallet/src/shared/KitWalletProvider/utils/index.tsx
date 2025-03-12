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
import { NavigationHeader } from '../../NavigationHeader'
import { WalletHeader } from '../../WalletHeader'
import { SettingsMenu } from '../../../views/Settings/Menu'
import { SettingsProfiles } from '../../../views/Settings/Profiles'
import { SettingsApps } from '../../../views/Settings/Apps'
import { SettingsWallets } from '../../../views/Settings'

export const getContent = (navigation: Navigation) => {
  const { location } = navigation

  switch (location) {
    case 'send':
      return <History />
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
      return <History />
    case 'receive':
      return <Receive />
    case 'buy':
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
    case 'settings-profiles':
      return <SettingsProfiles />
    case 'settings-apps':
      return <SettingsApps />
    // case 'filter-collectibles':
    //   return <FilterCollectibles />
    // case 'filter-tokens':
    //   return <FilterTokens />
    // case 'filter-transactions':
    //   return <FilterTransactions />
    case 'legacy-settings':
      return <LegacySettingsMenu />
    case 'legacy-settings-general':
      return <LegacySettingsGeneral />
    case 'legacy-settings-currency':
      return <LegacySettingsCurrency />
    case 'legacy-settings-networks':
      return <LegacySettingsNetwork />
    case 'coin-details':
      return <CoinDetails contractAddress={navigation.params.contractAddress} chainId={navigation.params.chainId} />
    case 'collectible-details':
      return (
        <CollectibleDetails
          contractAddress={navigation.params.contractAddress}
          chainId={navigation.params.chainId}
          tokenId={navigation.params.tokenId}
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
      return <NavigationHeader primaryText="Search tokens" />
    case 'search-collectibles':
      return <NavigationHeader primaryText="Search collectibles" />
    case 'filter-collectibles':
      return <NavigationHeader primaryText="Collectibles filter" />
    case 'filter-tokens':
      return <NavigationHeader primaryText="Tokens filter" />
    case 'filter-transactions':
      return <NavigationHeader primaryText="Transactions filter" />
    case 'legacy-settings':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Settings" />
    case 'legacy-settings-general':
      return <NavigationHeader secondaryText="Wallet / Settings / " primaryText="General" />
    case 'legacy-settings-currency':
      return <NavigationHeader secondaryText="Wallet / Settings / " primaryText="Currency" />
    case 'legacy-settings-networks':
      return <NavigationHeader secondaryText="Wallet / Settings / " primaryText="Networks" />
    case 'history':
      return <NavigationHeader secondaryText="Wallet / " primaryText="History" />
    case 'coin-details':
      return <WalletHeader />
    case 'collectible-details':
      return <WalletHeader />
    case 'transaction-details':
      return <NavigationHeader secondaryText="" primaryText="" />
    case 'send':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Send" />
    case 'send-coin':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Send Coin" />
    case 'send-collectible':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Send Collectible" />
    case 'swap':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Swap" />
    case 'swap-coin':
    case 'swap-coin-list':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Buy" />
    case 'receive':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Receive" />
    case 'buy':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Add Funds" />
    case 'home':
    default:
      return <WalletHeader />
  }
}
