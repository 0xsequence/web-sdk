import { Card, cardVariants, ChevronRightIcon, cn, GradientAvatar, Text } from '@0xsequence/design-system'
import { SlideupDrawer } from '../shared/SlideupDrawer'
import { useSettings } from '../hooks'
import { useState } from 'react'
import { formatAddress } from '@0xsequence/kit'

export enum FilterType {
  menu = 'Filters',
  wallets = 'Select a Wallet',
  networks = 'Select a Network',
  collections = 'Select a Collection'
}

export const FilterMenu = ({
  label,
  buttonLabel,
  type,
  onClose,
  handleButtonPress
}: {
  label: string
  buttonLabel: string
  type: 'tokens' | 'collectibles' | 'transactions'
  onClose: () => void
  handleButtonPress: () => void
}) => {
  const { selectedWallets, selectedNetworks, selectedCollections } = useSettings()

  const [selectedFilter, setSelectedFilter] = useState<FilterType>(FilterType.menu)

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter)
  }

  const walletsCount =
    selectedWallets.length > 1 ? (
      <Text color="primary" fontWeight="medium" variant="normal">
        All
      </Text>
    ) : (
      <GradientAvatar address={selectedWallets[0]} size="sm" />
    )

  const networksCount =
    selectedNetworks.length > 1 ? (
      <Text color="primary" fontWeight="medium" variant="normal">
        All
      </Text>
    ) : (
      <Text color="primary" fontWeight="medium" variant="normal">
        {selectedNetworks[0]}
      </Text>
    )

  const collectionsCount = selectedCollections.length === 0 ? 'All' : selectedCollections.length

  return (
    <SlideupDrawer
      onClose={onClose}
      label={selectedFilter === FilterType.menu ? label : selectedFilter}
      buttonLabel={buttonLabel}
      handleButtonPress={handleButtonPress}
      onBackPress={selectedFilter !== FilterType.menu ? () => handleFilterChange(FilterType.menu) : undefined}
    >
      {selectedFilter === FilterType.menu ? (
        <div className="flex flex-col gap-3">
          <div
            className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
            style={{ height: '60px' }}
            onClick={() => handleFilterChange(FilterType.wallets)}
          >
            <Text color="primary" fontWeight="medium" variant="normal">
              Wallets
            </Text>
            <div className="flex flex-row items-center gap-2">
              <Text color="primary" fontWeight="medium" variant="normal">
                {walletsCount}
              </Text>
              <ChevronRightIcon color="white" />
            </div>
          </div>
          <div
            className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
            style={{ height: '60px' }}
            onClick={() => handleFilterChange(FilterType.networks)}
          >
            <Text color="primary" fontWeight="medium" variant="normal">
              Networks
            </Text>
            <div className="flex flex-row items-center gap-2">
              <Text color="primary" fontWeight="medium" variant="normal">
                {networksCount}
              </Text>
              <ChevronRightIcon color="white" />
            </div>
          </div>
          {type === 'collectibles' && (
            <div
              className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
              style={{ height: '60px' }}
              onClick={() => handleFilterChange(FilterType.collections)}
            >
              <Text color="primary" fontWeight="medium" variant="normal">
                Collections
              </Text>
              <div className="flex flex-row items-center gap-2">
                <Text color="primary" fontWeight="medium" variant="normal">
                  {collectionsCount}
                </Text>
                <ChevronRightIcon color="white" />
              </div>
            </div>
          )}
        </div>
      ) : selectedFilter === FilterType.wallets ? (
        <div className="flex flex-col gap-3">
          {selectedWallets.map(wallet => (
            <div
              key={wallet}
              className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
              style={{ height: '60px' }}
              onClick={() => handleFilterChange(FilterType.wallets)}
            >
              <Text color="primary" fontWeight="medium" variant="normal">
                {formatAddress(wallet)}
              </Text>
            </div>
          ))}
        </div>
      ) : selectedFilter === FilterType.networks ? (
        <div className="flex flex-col gap-3">
          <Text color="primary" fontWeight="medium" variant="normal">
            Networks
          </Text>
        </div>
      ) : selectedFilter === FilterType.collections ? (
        <div className="flex flex-col gap-3">
          <Text color="primary" fontWeight="medium" variant="normal">
            Collections
          </Text>
        </div>
      ) : null}
    </SlideupDrawer>
  )
}

// TODO: swap out collectionsCount with home screen icons later
// TODO: add icons to networks
