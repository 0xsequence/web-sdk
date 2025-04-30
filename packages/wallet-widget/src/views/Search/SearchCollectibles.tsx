import { useGetContractInfo } from '@0xsequence/hooks'
import { useObservable } from 'micro-observables'
import { useEffect } from 'react'

import { CollectiblesList } from '../../components/SearchLists/CollectiblesList'
import { useSettings, useNavigation, useGetAllTokensDetails } from '../../hooks'
import { TokenBalanceWithPrice } from '../../utils'

export const SearchCollectibles = ({
  contractAddress,
  chainId
}: {
  contractAddress: string | undefined
  chainId: number | undefined
}) => {
  const {
    selectedWalletsObservable,
    selectedNetworksObservable,
    selectedCollectionsObservable,
    hideUnlistedTokens,
    setSelectedCollections
  } = useSettings()
  const { setNavigation } = useNavigation()

  // Only fetch contract info if contract address and chain id are provided
  const { data: contractInfo } = useGetContractInfo(
    {
      chainID: String(chainId),
      contractAddress: contractAddress || ''
    },
    { disabled: !contractAddress || !chainId }
  )

  useEffect(() => {
    if (contractAddress && chainId && contractInfo) {
      setSelectedCollections([
        {
          contractAddress,
          chainId: Number(chainId),
          logoURI: contractInfo.logoURI,
          name: contractInfo.name
        }
      ])
    } else {
      setSelectedCollections([])
    }
  }, [contractInfo, contractAddress, chainId])

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
    if (isSingleCollectionSelected && selectedCollections[0]) {
      // Ensure we only show tokens from the selected collection's chain and contract
      return (
        token.chainId === selectedCollections[0].chainId &&
        token.contractAddress.toLowerCase() === selectedCollections[0].contractAddress.toLowerCase()
      )
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

  // Get the single selected collection details if available
  const singleCollection = isSingleCollectionSelected ? selectedCollections[0] : null

  // Prepare the header info object, only if a single collection is selected
  const collectionHeaderInfo = singleCollection
    ? {
        logoURI: singleCollection.logoURI,
        name: singleCollection.name,
        chainId: singleCollection.chainId
        // We could add collectibleBalancesFiltered.length here if needed later
      }
    : undefined

  return (
    <div className="p-4 pt-2 w-full flex flex-col">
      <CollectiblesList
        tokenBalancesData={collectibleBalancesFiltered}
        isLoadingFirstPage={isLoading}
        collectionHeaderInfo={collectionHeaderInfo} // Pass the new prop
        onTokenClick={onHandleCollectibleClick}
      />
    </div>
  )
}
