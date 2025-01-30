import { Box, Text, TokenImage } from '@0xsequence/design-system'
import { useConfig } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { useSettings } from '../../hooks'
import { SelectButton } from '../../shared/SelectButton'
import { useWalletSettings } from '@0xsequence/kit'

import { ChainId } from '@0xsequence/network'

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
    <Box style={{ paddingTop: HEADER_HEIGHT }}>
      <Box padding="5" paddingTop="3">
        <Text variant="small" fontWeight="bold" color="text50">
          Networks
        </Text>
        <Box flexDirection="column" gap="2" marginTop="4">
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
                <Box gap="2" justifyContent="center" alignItems="center">
                  <TokenImage src={`https://assets.sequence.info/images/networks/medium/${chain}.webp`} />
                  <Text color="text100" variant="normal" fontWeight="bold">
                    {ChainId[chain]}
                  </Text>
                </Box>
              </SelectButton>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
