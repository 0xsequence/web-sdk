import { formatAddress, useWallets } from '@0xsequence/connect'
import { cardVariants, ChevronRightIcon, cn, GradientAvatar, Text, TokenImage } from '@0xsequence/design-system'
import { ContractType } from '@0xsequence/indexer'
import { ChainId } from '@0xsequence/network'
import { useGetTokenBalancesSummary } from '@0xsequence/react-hooks'
import { useObservable } from 'micro-observables'
import { useState } from 'react'

import { GradientAvatarList } from '../components/GradientAvatarList'
import { SelectRow } from '../components/SelectRow/SelectRow'
import { SlideupDrawer } from '../components/SlideupDrawer'
import { WalletAccountGradient } from '../components/WalletAccountGradient'
import { useSettings, SettingsCollection } from '../hooks'
import { getConnectorLogo } from '../utils/wallets'

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

  const { data: tokens } = useGetTokenBalancesSummary({
    chainIds: selectedNetworks,
    filter: {
      accountAddresses: selectedWallets.map(wallet => wallet.address),
      omitNativeBalances: true
    }
  })

  const collections = tokens
    ?.filter(token => token.contractType === ContractType.ERC721 || token.contractType === ContractType.ERC1155)
    .map(collection => {
      return {
        contractAddress: collection.contractAddress,
        contractInfo: {
          name: collection.contractInfo?.name || '',
          logoURI: collection.contractInfo?.logoURI || ''
        }
      }
    })

  const [selectedFilter, setSelectedFilter] = useState<FilterType>(
    type === 'bypassMenuWallets' ? FilterType.wallets : FilterType.menu
  )

  const walletsPreview = selectedWallets.length > 1 ? 'All' : <GradientAvatar address={selectedWallets[0].address} size="sm" />

  const networksPreview =
    selectedNetworks.length > 1 ? (
      'All'
    ) : (
      <TokenImage src={`https://assets.sequence.info/images/networks/medium/${selectedNetworks[0]}.webp`} />
    )

  const collectionsPreview =
    collections?.length === 0 ? (
      'N/A'
    ) : selectedCollections.length === 0 ? (
      'All'
    ) : (
      <TokenImage src={selectedCollections[0].contractInfo?.logoURI} />
    )

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
      setSelectedCollections([])
    }
  }

  const handleCollectionChange = (collection: SettingsCollection | undefined) => {
    if (!collection) {
      setSelectedCollections([])
    } else {
      setSelectedCollections([collection])
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
                {walletsPreview}
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
                {networksPreview}
              </Text>
              <ChevronRightIcon color="white" />
            </div>
          </div>
          {type === 'collectibles' && (
            <div
              className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
              style={{ height: '60px' }}
              onClick={collections?.length ? () => handleFilterChange(FilterType.collections) : undefined}
            >
              <Text color="primary" fontWeight="medium" variant="normal">
                Collections
              </Text>
              <div className="flex flex-row items-center gap-2">
                <Text color="primary" fontWeight="medium" variant="normal">
                  {collectionsPreview}
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
              <WalletAccountGradient
                accountAddress={wallet.address}
                loginIcon={getConnectorLogo(wallet.signInMethod)}
                size={'small'}
              />
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
          {collections?.length && collections.length > 1 && (
            <SelectRow
              key="all"
              isSelected={selectedCollectionsObservable.get().length === 0}
              onClick={() => handleCollectionChange(undefined)}
            >
              <Text color="primary" fontWeight="medium" variant="normal">
                All
              </Text>
            </SelectRow>
          )}
          {collections?.map(collection => (
            <SelectRow
              key={collection.contractAddress}
              isSelected={
                selectedCollectionsObservable.get().find(c => c.contractAddress === collection.contractAddress) !== undefined ||
                collections.length === 1
              }
              onClick={() => handleCollectionChange(collection)}
            >
              <TokenImage src={collection.contractInfo?.logoURI} />
              <Text color="primary" fontWeight="medium" variant="normal">
                {collection.contractInfo?.name}
              </Text>
            </SelectRow>
          ))}
        </div>
      ) : null}
    </SlideupDrawer>
  )
}

// TODO: swap out collectionsPreview with home screen icons later
// TODO: add icons to networks
