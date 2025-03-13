import { Text, TokenImage } from '@0xsequence/design-system'
import { ChainId } from '@0xsequence/network'
import { useWalletSettings } from '@0xsequence/react-connect'
import { useConfig } from 'wagmi'

import { SelectButton } from '../../components/SelectButton'
import { HEADER_HEIGHT } from '../../constants'
import { useSettings } from '../../hooks'

export const SettingsNetwork = () => {
  const { readOnlyNetworks, displayedAssets } = useWalletSettings()
  const { selectedNetworks, setSelectedNetworks } = useSettings()
  const { chains } = useConfig()

  const allChains = [
    ...new Set([...chains.map(chain => chain.id), ...(readOnlyNetworks || []), ...displayedAssets.map(asset => asset.chainId)])
  ]

  const onClickNetwork = (chainId: number) => {
    if (selectedNetworks.includes(chainId)) {
      if (selectedNetworks.length === 1) {
        return
      }
      setSelectedNetworks(selectedNetworks.filter(id => id !== chainId))
    } else {
      setSelectedNetworks([...selectedNetworks, chainId])
    }
  }

  return (
    <div style={{ paddingTop: HEADER_HEIGHT }}>
      <div className="p-5 pt-3">
        <Text variant="small" fontWeight="bold" color="muted">
          Networks
        </Text>
        <div className="flex flex-col gap-2 mt-4">
          {allChains.map(chain => {
            return (
              <SelectButton
                disabled={selectedNetworks.length === 1 && selectedNetworks.includes(chain)}
                key={chain}
                selected={selectedNetworks.includes(chain)}
                onClick={() => onClickNetwork(chain)}
                value={chain}
                squareIndicator
              >
                <div className="flex gap-2 justify-center items-center">
                  <TokenImage src={`https://assets.sequence.info/images/networks/medium/${chain}.webp`} />
                  <Text color="primary" variant="normal" fontWeight="bold">
                    {ChainId[chain]}
                  </Text>
                </div>
              </SelectButton>
            )
          })}
        </div>
      </div>
    </div>
  )
}
