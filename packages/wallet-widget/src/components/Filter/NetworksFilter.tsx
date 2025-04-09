import { Text } from '@0xsequence/design-system'
import { useObservable } from 'micro-observables'

import { useSettings } from '../../hooks'
import { MediaIconWrapper } from '../IconWrappers'
import { ListCardSelect } from '../ListCard/ListCardSelect'

import { NetworkRow } from './NetworkRow'

export const NetworksFilter = () => {
  const { selectedNetworksObservable, setSelectedNetworks, allNetworks } = useSettings()
  const selectedNetworks = useObservable(selectedNetworksObservable)
  // NetworksFilter is using an observable since its used in settings detached from FilterMenu

  return (
    <div className="flex flex-col bg-background-primary gap-3">
      {allNetworks.length > 1 && (
        <ListCardSelect key="all" isSelected={selectedNetworks.length > 1} onClick={() => setSelectedNetworks([])}>
          <MediaIconWrapper
            iconList={allNetworks.map(network => `https://assets.sequence.info/images/networks/medium/${network}.webp`)}
            size="sm"
          />
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
