import { Text } from '@0xsequence/design-system'

import { useSettings } from '../../hooks/index.js'
import { ListCardSelect } from '../ListCard/ListCardSelect.js'

export const CollectionsFilter = () => {
  const { showCollectionsObservable, setShowCollections } = useSettings()
  const showCollections = showCollectionsObservable.get()

  return (
    <div className="flex flex-col bg-background-primary gap-3">
      <ListCardSelect key="Items" isSelected={!showCollections} onClick={() => setShowCollections(false)}>
        <Text color="primary" fontWeight="medium" variant="normal">
          Items
        </Text>
      </ListCardSelect>
      <ListCardSelect key="Collections" isSelected={showCollections} onClick={() => setShowCollections(true)}>
        <Text color="primary" fontWeight="medium" variant="normal">
          Collections
        </Text>
      </ListCardSelect>
    </div>
  )
}
