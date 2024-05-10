import { Box, Text, TokenImage } from '@0xsequence/design-system'
import React from 'react'
import { useConfig } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { useSettings } from '../../hooks'
import { SelectButton } from '../../shared/SelectButton'

export const SettingsNetwork = () => {
  const { selectedNetworks, setSelectedNetworks } = useSettings()
  const { chains } = useConfig()

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
          {chains.map(chain => {
            return (
              <SelectButton
                disabled={selectedNetworks.length === 1 && selectedNetworks.includes(chain.id)}
                key={chain.id}
                selected={selectedNetworks.includes(chain.id)}
                onClick={() => onClickNetwork(chain.id)}
                value={chain.id}
                squareIndicator
              >
                <Box gap="2" justifyContent="center" alignItems="center">
                  <TokenImage src={`https://assets.sequence.info/images/networks/medium/${chain.id}.webp`} />
                  <Text color="text100" variant="normal" fontWeight="bold">
                    {chain.name}
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
