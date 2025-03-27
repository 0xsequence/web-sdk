import { Text, TokenImage } from '@0xsequence/design-system'
import { ChainId } from '@0xsequence/network'
import { useObservable } from 'micro-observables'

import { ListCardSelect } from '../../components/ListCard/ListCardSelect'
import { useSettings } from '../../hooks'

export const SettingsNetworks = () => {
  const { selectedNetworksObservable, setSelectedNetworks, allNetworks } = useSettings()
  const selectedNetworks = useObservable(selectedNetworksObservable)

  return (
    <div className="flex flex-col pb-5 px-4 pt-3 gap-2">
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
        <ListCardSelect
          key={chainId}
          isSelected={selectedNetworks.length === 1 && selectedNetworks.includes(chainId)}
          onClick={() => setSelectedNetworks([chainId])}
        >
          <div className="flex gap-2 justify-center items-center">
            <TokenImage src={`https://assets.sequence.info/images/networks/medium/${chainId}.webp`} />
            <Text color="primary" variant="normal" fontWeight="bold">
              {ChainId[chainId]}
            </Text>
          </div>
        </ListCardSelect>
      ))}
    </div>
  )
}
