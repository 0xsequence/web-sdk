import type { Navigation } from '../../../contexts/index.js'
import { CollectionDetails } from '../../../views/CollectionDetails/index.js'
import {
  Buy,
  CoinDetails,
  CollectibleDetails,
  Home,
  Receive,
  Search,
  SendCoin,
  SendCollectible,
  SendGeneral,
  SettingsApps,
  SettingsCurrency,
  SettingsMenu,
  SettingsPreferences,
  SettingsProfiles,
  SettingsWallets,
  // QrScan,
  Swap,
  SwapCoin,
  SwapList,
  TransactionDetails
} from '../../../views/index.js'
import { NavigationHeader } from '../../NavigationHeader/index.js'

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
    case 'buy':
      return <Buy />
    case 'search':
      return <Search />
    case 'settings':
      return <SettingsMenu />
    case 'settings-wallets':
      return <SettingsWallets />
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
    case 'home':
      return <NavigationHeader type="home" />
    case 'settings':
      return <NavigationHeader label="Settings" />
    case 'settings-wallets':
      return <NavigationHeader label="Wallets" />
    case 'settings-currency':
      return <NavigationHeader label="Currency" />
    case 'settings-profiles':
      return <NavigationHeader label="Profiles" />
    case 'settings-preferences':
      return <NavigationHeader label="Preferences" />
    case 'settings-apps':
      return <NavigationHeader />
    case 'connect-dapp':
      return <NavigationHeader />
    case 'coin-details':
      return (
        <NavigationHeader
          type="token"
          info={{
            chainId: navigation.params.chainId,
            contractAddress: navigation.params.contractAddress,
            accountAddress: navigation.params.accountAddress
          }}
        />
      )
    case 'collectible-details':
      return (
        <NavigationHeader
          type="collectible"
          info={{
            chainId: navigation.params.chainId,
            contractAddress: navigation.params.contractAddress,
            tokenId: navigation.params.tokenId
          }}
        />
      )
    case 'collection-details':
      return (
        <NavigationHeader
          type="collection"
          info={{
            chainId: navigation.params.chainId,
            contractAddress: navigation.params.contractAddress
          }}
        />
      )
    case 'transaction-details':
      return <NavigationHeader />
    case 'send-general':
    case 'send-coin':
    case 'send-collectible':
      return <NavigationHeader label="Send" />
    case 'swap':
    case 'swap-coin':
    case 'swap-coin-list':
      return <NavigationHeader label="Swap" />
    case 'receive':
      return <NavigationHeader label="Receive" />
    case 'buy':
      return <NavigationHeader label="Buy" />
    case 'search':
      return <NavigationHeader type="search" />
  }
}
