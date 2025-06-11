import { Text } from '@0xsequence/design-system'

import { useGetAllTokensDetails, useSettings } from '../../hooks/index.js'
import { useGetAllCollections } from '../../hooks/useGetAllCollections.js'
import { ListCard } from '../ListCard/ListCard.js'

export const CollectionsFilter = ({ onClose }: { onClose: () => void }) => {
  const { selectedWallets, selectedNetworks, showCollectionsObservable, setShowCollections, hideUnlistedTokens } = useSettings()
  const showCollections = showCollectionsObservable.get()

  const { data: collections } = useGetAllCollections({
    accountAddresses: selectedWallets.map(wallet => wallet.address),
    chainIds: selectedNetworks,
    hideUnlistedTokens
  })

  const { data: tokens } = useGetAllTokensDetails({
    accountAddresses: selectedWallets.map(wallet => wallet.address),
    chainIds: selectedNetworks,
    hideUnlistedTokens
  })

  const collectionsCount = collections.length
  const itemsCount = tokens.filter(token => token.contractType === 'ERC721' || token.contractType === 'ERC1155').length

  const onClickItems = (showCollections: boolean) => {
    setShowCollections(showCollections)
    onClose()
  }

  return (
    <div className="flex flex-col bg-background-primary gap-3">
      <ListCard key="Items" type="radio" isSelected={!showCollections} onClick={() => onClickItems(false)}>
        <div>
          <Text color="primary" variant="normal">
            Items{' '}
          </Text>
          <Text color="muted" variant="normal">
            ({itemsCount})
          </Text>
        </div>
      </ListCard>
      <ListCard key="Collections" type="radio" isSelected={showCollections} onClick={() => onClickItems(true)}>
        <div>
          <Text color="primary" variant="normal">
            Collections{' '}
          </Text>
          <Text color="muted" variant="normal">
            ({collectionsCount})
          </Text>
        </div>
      </ListCard>
    </div>
  )
}
