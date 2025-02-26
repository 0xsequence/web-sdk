import React from 'react'

import { Navigation } from '../../../contexts'
import {
  CoinDetails,
  CollectibleDetails,
  CollectionDetails,
  History,
  Home,
  Receive,
  SearchWallet,
  SearchWalletViewAll,
  SendCoin,
  SendCollectible,
  SettingsCurrency,
  SettingsGeneral,
  SettingsMenu,
  SettingsNetwork,
  SwapCoin,
  SwapList,
  TransactionDetails
} from '../../../views'
import { NavigationHeader } from '../../NavigationHeader'
import { WalletHeader } from '../../WalletHeader'

export const getContent = (navigation: Navigation) => {
  const { location } = navigation

  switch (location) {
    case 'send-coin':
      return (
        <SendCoin chainId={navigation.params.chainId} contractAddress={navigation.params.contractAddress} />
      )
    case 'send-collectible':
      return (
        <SendCollectible
          chainId={navigation.params.chainId}
          contractAddress={navigation.params.contractAddress}
          tokenId={navigation.params.tokenId}
        />
      )
    case 'receive':
      return <Receive />
    case 'history':
      return <History />
    case 'search':
      return <SearchWallet />
    case 'search-view-all':
      return <SearchWalletViewAll defaultTab={navigation.params.defaultTab} />
    case 'settings':
      return <SettingsMenu />
    case 'settings-general':
      return <SettingsGeneral />
    case 'settings-currency':
      return <SettingsCurrency />
    case 'settings-networks':
      return <SettingsNetwork />
    case 'coin-details':
      return (
        <CoinDetails
          contractAddress={navigation.params.contractAddress}
          chainId={navigation.params.chainId}
        />
      )
    case 'collectible-details':
      return (
        <CollectibleDetails
          contractAddress={navigation.params.contractAddress}
          chainId={navigation.params.chainId}
          tokenId={navigation.params.tokenId}
        />
      )
    case 'collection-details':
      return (
        <CollectionDetails
          contractAddress={navigation.params.contractAddress}
          chainId={navigation.params.chainId}
        />
      )
    case 'transaction-details':
      return <TransactionDetails transaction={navigation.params.transaction} />
    case 'swap-coin':
      return (
        <SwapCoin contractAddress={navigation.params.contractAddress} chainId={navigation.params.chainId} />
      )
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
    case 'settings':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Settings" />
    case 'settings-general':
      return <NavigationHeader secondaryText="Wallet / Settings / " primaryText="General" />
    case 'settings-currency':
      return <NavigationHeader secondaryText="Wallet / Settings / " primaryText="Currency" />
    case 'settings-networks':
      return <NavigationHeader secondaryText="Wallet / Settings / " primaryText="Networks" />
    case 'receive':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Receive" />
    case 'history':
      return <NavigationHeader secondaryText="Wallet / " primaryText="History" />
    case 'coin-details':
      return <WalletHeader />
    case 'collectible-details':
      return <WalletHeader />
    case 'transaction-details':
      return <NavigationHeader secondaryText="" primaryText="" />
    case 'send-collectible':
    case 'send-coin':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Send" />
    case 'swap-coin':
    case 'swap-coin-list':
      return <NavigationHeader secondaryText="Wallet / " primaryText="Buy" />
    case 'home':
    default:
      return <WalletHeader />
  }
}
