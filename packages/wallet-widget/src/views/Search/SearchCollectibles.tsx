import { useObservable } from 'micro-observables'

import { CollectiblesList } from '../../components/SearchLists/CollectiblesList'
import { useSettings, useNavigation, useGetAllTokensDetails } from '../../hooks'
import { TokenBalanceWithPrice } from '../../utils'

export const SearchCollectibles = () => {
  const { selectedWalletsObservable, selectedNetworksObservable, selectedCollectionsObservable, hideUnlistedTokens } =
    useSettings()
  const { setNavigation } = useNavigation()

  const selectedWallets = useObservable(selectedWalletsObservable)
  const selectedNetworks = useObservable(selectedNetworksObservable)
  const selectedCollections = useObservable(selectedCollectionsObservable)

  const { data: tokenBalancesData = [], isLoading } = useGetAllTokensDetails({
    accountAddresses: selectedWallets.map(wallet => wallet.address),
    chainIds: selectedNetworks,
    contractWhitelist: selectedCollections.map(collection => collection.contractAddress),
    hideUnlistedTokens
  })

  const isSingleCollectionSelected = selectedCollections.length === 1

  const collectibleBalancesFiltered = tokenBalancesData.filter(token => {
    if (isSingleCollectionSelected) {
      return token.chainId === selectedCollections[0].chainId
    }
    return true
  })

  const onHandleCollectibleClick = (balance: TokenBalanceWithPrice) => {
    setNavigation({
      location: 'collectible-details',
      params: {
        contractAddress: balance.contractAddress,
        chainId: balance.chainId,
        tokenId: balance.tokenID || '',
        accountAddress: balance.accountAddress
      }
    })
  }

  return (
    <div className="p-4 pt-2 w-full">
      <CollectiblesList
        tokenBalancesData={collectibleBalancesFiltered}
        isLoadingFirstPage={isLoading}
        onTokenClick={onHandleCollectibleClick}
        enableFilters={true}
      />
    </div>
  )
}
