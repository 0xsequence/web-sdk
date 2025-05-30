import { useObservable } from 'micro-observables'

import { useSettings } from '../../hooks/index.js'
import { ListCardNetwork } from '../ListCard/ListCardNetwork.js'

export const NetworksFilter = () => {
  const { selectedNetworksObservable, setSelectedNetworks, allNetworks } = useSettings()
  const selectedNetworks = useObservable(selectedNetworksObservable)

  const onClickNetwork = (chainId: number) => {
    if (selectedNetworks.length === allNetworks.length) {
      setSelectedNetworks([chainId])
    } else {
      if (selectedNetworks.includes(chainId)) {
        setSelectedNetworks(selectedNetworks.filter(n => n !== chainId))
      } else {
        setSelectedNetworks([...selectedNetworks, chainId])
      }
    }
  }

  return (
    <div className="flex flex-col bg-background-primary gap-3">
      {allNetworks.map(chainId => (
        <ListCardNetwork
          key={chainId}
          chainId={chainId}
          isSelected={selectedNetworks.length !== allNetworks.length && selectedNetworks.includes(chainId)}
          onClick={() => onClickNetwork(chainId)}
        />
      ))}
    </div>
  )
}
