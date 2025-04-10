import { ContractVerificationStatus } from '@0xsequence/connect'
import { useGetTokenBalancesDetails } from '@0xsequence/hooks'
import { useObservable } from 'micro-observables'

import { CollectiblesList } from '../../components/SearchLists/CollectiblesList'
import { useSettings, useNavigation } from '../../hooks'
import { TokenBalanceWithPrice } from '../../utils'

export const SearchCollectibles = () => {
  const { selectedWalletsObservable, selectedNetworksObservable, selectedCollectionsObservable, hideUnlistedTokens } =
    useSettings()
  const { setNavigation } = useNavigation()

  const selectedWallets = useObservable(selectedWalletsObservable)
  const selectedNetworks = useObservable(selectedNetworksObservable)
  const selectedCollections = useObservable(selectedCollectionsObservable)

  const { data: tokenBalancesData = [], isPending: isPendingTokenBalances } = useGetTokenBalancesDetails({
    chainIds: selectedNetworks,
    filter: {
      accountAddresses: selectedWallets.map(wallet => wallet.address),
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      contractWhitelist: selectedCollections.map(collection => collection.contractAddress),
      omitNativeBalances: false
    }
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
        isPendingTokenBalances={isPendingTokenBalances}
        onTokenClick={onHandleCollectibleClick}
        enableFilters={true}
      />
    </div>
  )
}
