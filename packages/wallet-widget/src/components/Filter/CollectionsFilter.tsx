import { Text, TokenImage } from '@0xsequence/design-system'

import { useGetCollections, useSettings } from '../../hooks'
import { MediaIconWrapper } from '../IconWrappers'
import { ListCardSelect } from '../ListCard/ListCardSelect'

export const CollectionsFilter = () => {
  const { selectedCollectionsObservable, selectedNetworks, selectedWallets, setSelectedCollections } = useSettings()
  const selectedCollections = selectedCollectionsObservable.get()

  const { data: collections } = useGetCollections({
    accountAddresses: selectedWallets.map(wallet => wallet.address),
    chainIds: selectedNetworks,
    hideUnlistedTokens: true
  })

  return (
    <div className="flex flex-col bg-background-primary gap-3">
      {collections?.length && collections.length > 1 && (
        <ListCardSelect
          key="all"
          isSelected={selectedCollectionsObservable.get().length === 0}
          onClick={() => setSelectedCollections([])}
        >
          <MediaIconWrapper
            iconList={collections.map(collection => (
              <div className="bg-background-backdrop rounded-full">
                <TokenImage src={collection.logoURI} symbol={collection.name} />
              </div>
            ))}
            size="sm"
          />
          <Text color="primary" fontWeight="medium" variant="normal">
            All
          </Text>
        </ListCardSelect>
      )}
      {collections?.map(collection => (
        <ListCardSelect
          key={collection.contractAddress}
          isSelected={
            selectedCollections.some(c => c.contractAddress === collection.contractAddress && c.chainId === collection.chainId) ||
            collections.length === 1
          }
          onClick={collections.length > 1 ? () => setSelectedCollections([collection]) : undefined}
        >
          <TokenImage src={collection.logoURI} symbol={collection.name} withNetwork={collection.chainId} />
          <Text color="primary" fontWeight="medium" variant="normal">
            {collection.name}
          </Text>
        </ListCardSelect>
      ))}
    </div>
  )
}
