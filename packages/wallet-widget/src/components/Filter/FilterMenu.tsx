import { formatAddress, getNetwork, useWallets } from '@0xsequence/connect'
import { Text, TokenImage } from '@0xsequence/design-system'
import { useObservable } from 'micro-observables'
import { useState } from 'react'

import { useGetCollections, useSettings } from '../../hooks'
import { StackedIconTag } from '../IconWrappers'
import { ListCardNav } from '../ListCard'
import { SlideupDrawer } from '../Select/SlideupDrawer'

import { CollectionsFilter } from './CollectionsFilter'
import { NetworkImageCustom } from './NetworkImageCustom'
import { NetworksFilter } from './NetworksFilter'
import { WalletsFilter } from './WalletsFilter'

enum FilterType {
  menu = 'Filters',
  wallets = 'Select active Wallets',
  networks = 'Select active Networks',
  collections = 'Select active Collections'
}

export const FilterMenu = ({
  label,
  type,
  onClose
}: {
  label: string
  type: 'tokens' | 'collectibles' | 'transactions'
  onClose: () => void
}) => {
  const { wallets } = useWallets()
  const { selectedWalletsObservable, selectedNetworksObservable, selectedCollectionsObservable, hideUnlistedTokensObservable } =
    useSettings()
  const selectedWallets = useObservable(selectedWalletsObservable)
  const selectedNetworks = useObservable(selectedNetworksObservable)
  const selectedCollections = useObservable(selectedCollectionsObservable)
  const hideUnlistedTokens = useObservable(hideUnlistedTokensObservable)

  const [selectedFilter, setSelectedFilter] = useState<FilterType>(FilterType.menu)

  const { data: collections } = useGetCollections({
    accountAddresses: selectedWallets.map(wallet => wallet.address),
    chainIds: selectedNetworks,
    hideUnlistedTokens
  })

  const walletsPreview =
    selectedWallets.length > 1 || wallets.length === 1 ? (
      <StackedIconTag
        iconList={[]}
        label={
          <Text variant="normal" color="primary">
            All
          </Text>
        }
      />
    ) : (
      <div className="flex flex-row gap-2 items-center">
        <StackedIconTag
          iconList={[selectedWallets[0].address]}
          isAccount
          label={
            <Text variant="normal" color="primary" nowrap style={{ maxWidth: '200px' }} ellipsis>
              {formatAddress(selectedWallets[0].address)}
            </Text>
          }
        />
      </div>
    )

  const networksPreview =
    selectedNetworks.length > 1 ? (
      <div className="flex flex-row gap-2 items-center">
        <StackedIconTag
          iconList={[]}
          label={
            <Text variant="normal" color="primary">
              All
            </Text>
          }
        />
      </div>
    ) : (
      <StackedIconTag
        // iconList={[`https://assets.sequence.info/images/networks/medium/${selectedNetworks[0]}.webp`]}
        iconList={[<NetworkImageCustom chainId={selectedNetworks[0]} style={{ width: '16px', height: '16px' }} />]}
        label={
          <Text variant="normal" color="primary" nowrap style={{ maxWidth: '200px' }} ellipsis>
            {getNetwork(selectedNetworks[0]).title}
          </Text>
        }
      />
    )

  const collectionsPreview =
    collections?.length === 0 ? (
      <Text variant="normal" color="primary">
        N/A
      </Text>
    ) : selectedCollections.length === 0 ? (
      <StackedIconTag
        iconList={[]}
        label={
          <Text variant="normal" color="primary">
            All
          </Text>
        }
      />
    ) : (
      <StackedIconTag
        iconList={[<TokenImage size="xs" src={selectedCollections[0].logoURI} symbol={selectedCollections[0].name} />]}
        label={
          <Text variant="normal" color="primary" nowrap style={{ maxWidth: '200px' }} ellipsis>
            {selectedCollections[0].name}
          </Text>
        }
      />
    )

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter)
  }

  return (
    <SlideupDrawer
      onClose={onClose}
      label={selectedFilter === FilterType.menu ? label : selectedFilter}
      onBackPress={selectedFilter !== FilterType.menu ? () => handleFilterChange(FilterType.menu) : undefined}
    >
      {selectedFilter === FilterType.menu ? (
        <div className="flex flex-col bg-background-primary gap-3">
          <ListCardNav
            rightChildren={walletsPreview}
            style={{ height: '64px' }}
            onClick={() => handleFilterChange(FilterType.wallets)}
          >
            <Text color="primary" fontWeight="medium" variant="normal">
              Wallets
            </Text>
          </ListCardNav>
          <ListCardNav
            rightChildren={networksPreview}
            style={{ height: '64px' }}
            onClick={() => handleFilterChange(FilterType.networks)}
          >
            <Text color="primary" fontWeight="medium" variant="normal">
              Networks
            </Text>
          </ListCardNav>
          {type === 'collectibles' && (
            <ListCardNav
              rightChildren={collectionsPreview}
              style={{ height: '64px' }}
              disabled={collections?.length === 0}
              onClick={() => handleFilterChange(FilterType.collections)}
            >
              <Text color="primary" fontWeight="medium" variant="normal">
                Collections
              </Text>
            </ListCardNav>
          )}
        </div>
      ) : selectedFilter === FilterType.wallets ? (
        <WalletsFilter />
      ) : selectedFilter === FilterType.networks ? (
        <NetworksFilter />
      ) : selectedFilter === FilterType.collections ? (
        <CollectionsFilter />
      ) : null}
    </SlideupDrawer>
  )
}
