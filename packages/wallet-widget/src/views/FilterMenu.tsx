import { cardVariants, ChevronRightIcon, cn, GradientAvatar, Text, TokenImage } from '@0xsequence/design-system'
import { ChainId } from '@0xsequence/network'
import { formatAddress, useWallets } from '@0xsequence/react-connect'
import { useObservable } from 'micro-observables'
import { useState } from 'react'

import { GradientAvatarList } from '../components/GradientAvatarList'
import { SelectRow } from '../components/SelectRow/SelectRow'
import { SlideupDrawer } from '../components/SlideupDrawer'
import { WalletAccountGradient } from '../components/WalletAccountGradient'
import { useSettings } from '../hooks'

enum FilterType {
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
  type: 'tokens' | 'collectibles' | 'transactions' | 'bypassMenuWallets'
  onClose: () => void
  handleButtonPress: () => void
}) => {
  const { wallets } = useWallets()
  const {
    allNetworks,
    selectedWalletsObservable,
    selectedNetworksObservable,
    selectedCollectionsObservable,
    setSelectedWallets,
    setSelectedNetworks,
    setSelectedCollections
  } = useSettings()

  const selectedWallets = useObservable(selectedWalletsObservable)
  const selectedNetworks = useObservable(selectedNetworksObservable)
  const selectedCollections = useObservable(selectedCollectionsObservable)

  const [selectedFilter, setSelectedFilter] = useState<FilterType>(
    type === 'bypassMenuWallets' ? FilterType.wallets : FilterType.menu
  )

  const walletsCount =
    selectedWallets.length > 1 ? (
      <Text color="primary" fontWeight="medium" variant="normal">
        All
      </Text>
    ) : (
      <GradientAvatar address={selectedWallets[0].address} size="sm" />
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

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter)
  }

  const handleWalletChange = (wallet: string) => {
    if (wallet === '') {
      setSelectedWallets(wallets)
    } else {
      setSelectedWallets([wallets.find(w => w.address === wallet) || wallets[0]])
    }
  }

  const handleNetworkChange = (chainId: number[]) => {
    if (chainId.length === 0) {
      setSelectedNetworks(allNetworks)
    } else {
      setSelectedNetworks(chainId)
    }
  }

  return (
    <SlideupDrawer
      onClose={onClose}
      label={selectedFilter === FilterType.menu ? label : selectedFilter}
      buttonLabel={buttonLabel}
      handleButtonPress={handleButtonPress}
      onBackPress={
        type !== 'bypassMenuWallets' && selectedFilter !== FilterType.menu ? () => handleFilterChange(FilterType.menu) : undefined
      }
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
          {wallets.length > 1 && (
            <SelectRow key="all" isSelected={selectedWalletsObservable.get().length > 1} onClick={() => handleWalletChange('')}>
              <GradientAvatarList accountAddressList={wallets.map(wallet => wallet.address)} size="md" />
              <Text color="primary" fontWeight="medium" variant="normal">
                All
              </Text>
            </SelectRow>
          )}
          {wallets.map(wallet => (
            <SelectRow
              key={wallet.address}
              isSelected={
                selectedWalletsObservable.get().length === 1 &&
                selectedWalletsObservable.get().find(w => w.address === wallet.address) !== undefined
              }
              onClick={() => handleWalletChange(wallet.address)}
            >
              <WalletAccountGradient accountAddress={wallet.address} loginIcon={wallet.logoDark} size={'small'} />
              <Text color="primary" fontWeight="medium" variant="normal">
                {formatAddress(wallet.address)}
              </Text>
            </SelectRow>
          ))}
        </div>
      ) : selectedFilter === FilterType.networks ? (
        <div className="flex flex-col gap-3">
          {allNetworks.length > 1 && (
            <SelectRow key="all" isSelected={selectedNetworksObservable.get().length > 1} onClick={() => handleNetworkChange([])}>
              <Text color="primary" fontWeight="medium" variant="normal">
                All
              </Text>
            </SelectRow>
          )}
          {allNetworks.map(chainId => (
            <SelectRow
              key={chainId}
              isSelected={selectedNetworksObservable.get().length === 1 && selectedNetworksObservable.get().includes(chainId)}
              onClick={() => handleNetworkChange([chainId])}
            >
              <div className="flex gap-2 justify-center items-center">
                <TokenImage src={`https://assets.sequence.info/images/networks/medium/${chainId}.webp`} />
                <Text color="primary" variant="normal" fontWeight="bold">
                  {ChainId[chainId]}
                </Text>
              </div>
            </SelectRow>
          ))}
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
