import { useWallets } from '@0xsequence/connect'
import { CoinsIcon, GameIcon, GameSwordIcon, Text } from '@0xsequence/design-system'
import { useMemo } from 'react'

import { MiniButton } from '../components/MiniButton.js'
import { useSettings } from '../hooks/useSettings.js'

export const NoResults = ({ hasInstructions, customText }: { hasInstructions?: boolean; customText?: string }) => {
  const { wallets } = useWallets()
  const { selectedWallets, allNetworks, selectedNetworks, setSelectedWallets, setSelectedNetworks } = useSettings()

  const isSettingsChanged = useMemo(() => {
    return selectedWallets.length !== wallets.length || selectedNetworks.length !== allNetworks.length
  }, [selectedWallets, wallets, selectedNetworks, allNetworks])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4" style={{ marginTop: '80px', marginBottom: '80px' }}>
      <div className="flex flex-row gap-2">
        <CoinsIcon color="grey" />
        <GameIcon color="grey" />
        <GameSwordIcon color="grey" />
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <Text variant="medium" color="primary">
          {customText || 'No results found'}
        </Text>

        {hasInstructions && (
          <Text className="text-center" variant="normal" color="muted">
            Search your wallet for tokens,
            <br />
            collectibles or collections
          </Text>
        )}

        {isSettingsChanged && (
          <MiniButton
            onClick={() => {
              setSelectedWallets([])
              setSelectedNetworks([])
            }}
          >
            <Text variant="normal-bold" color="primary">
              Clear filters
            </Text>
          </MiniButton>
        )}
      </div>
    </div>
  )
}
