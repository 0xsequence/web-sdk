import React from 'react'
import { Box, Image, Text } from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId } from '@0xsequence/kit'

import { useConfig } from 'wagmi'

import { SelectButton } from '../../shared/SelectButton'
import { HEADER_HEIGHT } from '../../constants'
import { useSettings } from '../../hooks'

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
        <Text variant="small" color="text50">
          Networks
        </Text>
        <Box flexDirection="column" gap="2">
          {chains.map(chain => {
            const networkInfo = getNativeTokenInfoByChainId(chain.id, chains)
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
                  <Image width="3" height="3" src={networkInfo.logoURI} alt="network" />
                  <Text color="text100" variant="small">
                    {networkInfo.name}
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
