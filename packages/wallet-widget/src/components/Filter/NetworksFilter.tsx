import { Text } from '@0xsequence/design-system'
import { useObservable } from 'micro-observables'

import { useSettings } from '../../hooks/index.js'
import { MediaIconWrapper } from '../IconWrappers/index.js'
import { ListCardSelect } from '../ListCard/ListCardSelect.js'

import { NetworkImageCustom } from './NetworkImageCustom.js'
import { NetworkRow } from './NetworkRow.js'

export const NetworksFilter = () => {
  const { selectedNetworksObservable, setSelectedNetworks, allNetworks } = useSettings()
  const selectedNetworks = useObservable(selectedNetworksObservable)
  // NetworksFilter is using an observable since its used in settings detached from FilterMenu

  return (
    <div className="flex flex-col bg-background-primary gap-3">
      {allNetworks.length > 1 && (
        <ListCardSelect key="all" isSelected={selectedNetworks.length > 1} onClick={() => setSelectedNetworks([])}>
          <MediaIconWrapper
            iconList={allNetworks.map(network => (
              <NetworkImageCustom chainId={network} style={{ width: '32px', height: '32px' }} />
            ))}
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
