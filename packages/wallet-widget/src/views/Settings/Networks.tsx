import { Text } from '@0xsequence/design-system'
import { useObservable } from 'micro-observables'

import { NetworkRow } from '../../components/Filter/NetworkRow'
import { ListCardSelect } from '../../components/ListCard/ListCardSelect'
import { useSettings } from '../../hooks'

export const SettingsNetworks = () => {
  const { selectedNetworksObservable, setSelectedNetworks, allNetworks } = useSettings()
  const selectedNetworks = useObservable(selectedNetworksObservable)

  return (
    <div className="flex flex-col p-4 gap-2">
      {allNetworks.length > 1 && (
        <ListCardSelect
          key="all"
          isSelected={selectedNetworksObservable.get().length > 1}
          onClick={() => setSelectedNetworks([])}
        >
          <Text color="primary" fontWeight="medium" variant="normal">
            All
          </Text>
        </ListCardSelect>
      )}
      {allNetworks.map(chainId => (
        <NetworkRow
          key={chainId}
          chainId={chainId}
          isSelected={selectedNetworks.length === 1 && selectedNetworks.includes(chainId)}
          onClick={() => setSelectedNetworks([chainId])}
        />
      ))}
    </div>
  )
}
