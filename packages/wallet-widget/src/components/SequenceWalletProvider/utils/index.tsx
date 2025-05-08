import type { Navigation } from '../../../contexts'
import {
  CoinDetails,
  CollectibleDetails,
  History,
  Home,
  Receive,
  SearchCollectibles,
  SearchTokens,
  SendCoin,
  SendCollectible,
  SendGeneral,
  SettingsApps,
  SettingsCurrency,
  SettingsMenu,
  SettingsNetworks,
  SettingsPreferences,
  SettingsProfiles,
  SettingsWallets,
  // QrScan,
  Swap,
  SwapCoin,
  SwapList,
  TransactionDetails
} from '../../../views'
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
    case 'search-tokens':
      return <SearchTokens />
    case 'search-collectibles':
      return (
        <SearchCollectibles
          contractAddress={navigation.params?.selectedCollection?.contractAddress}
          chainId={navigation.params?.selectedCollection?.chainId}
        />
      )
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
    // case 'connect-dapp':
    //   return <QrScan />
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
    case 'search-tokens':
      return <NavigationHeader primaryText="Tokens" />
    case 'search-collectibles':
      return <NavigationHeader primaryText="Collectibles" />
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
      return <WalletHeader primaryText="Send" enableAccountSelector />
    case 'send-coin':
      return <WalletHeader primaryText="Send Coin" />
    case 'send-collectible':
      return <WalletHeader primaryText="Send Collectible" />
    case 'swap':
      return <WalletHeader primaryText="Swap" enableAccountSelector />
    case 'swap-coin':
    case 'swap-coin-list':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Buy" />
    case 'receive':
      return <WalletHeader primaryText="Receive" enableAccountSelector />
  }
}
