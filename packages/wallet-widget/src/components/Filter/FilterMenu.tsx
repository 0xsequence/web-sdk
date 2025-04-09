import { formatAddress, getNetwork, useWallets } from '@0xsequence/connect'
import { Text, TokenImage } from '@0xsequence/design-system'
import { useGetTokenBalancesSummary } from '@0xsequence/hooks'
import { ContractType } from '@0xsequence/indexer'
import { useObservable } from 'micro-observables'
import { useState } from 'react'

import { useSettings } from '../../hooks'
import { useFiatWalletsMap } from '../../hooks/useFiatWalletsMap'
import { getConnectorLogo } from '../../utils/wallets'
import { MediaIconWrapper, StackedIconTag } from '../IconWrappers'
import { ListCardNav } from '../ListCard'
import { ListCardSelect } from '../ListCard/ListCardSelect'
import { SlideupDrawer } from '../SlideupDrawer'
import { WalletAccountGradient } from '../WalletAccountGradient'

import { NetworkRow } from './NetworkRow'

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
  type: 'tokens' | 'collectibles' | 'transactions' | 'bypassMenuWallets'
  onClose: () => void
}) => {
  const { wallets } = useWallets()
  const {
    allNetworks,
    selectedWalletsObservable,
    selectedNetworksObservable,
    selectedCollectionsObservable,
    fiatCurrency,
    setSelectedWallets,
    setSelectedNetworks,
    setSelectedCollections
  } = useSettings()
  const { fiatWalletsMap } = useFiatWalletsMap()

  const selectedWallets = useObservable(selectedWalletsObservable)
  const selectedNetworks = useObservable(selectedNetworksObservable)
  const selectedCollections = useObservable(selectedCollectionsObservable)

  const totalFiatValue = fiatWalletsMap.reduce((acc, wallet) => acc + Number(wallet.fiatValue), 0).toFixed(2)

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

  const walletsPreview =
    selectedWallets.length > 1 ? (
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
        iconList={[`https://assets.sequence.info/images/networks/medium/${selectedNetworks[0]}.webp`]}
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
        iconList={[selectedCollections[0].contractInfo?.logoURI]}
        label={
          <Text variant="normal" color="primary" nowrap style={{ maxWidth: '200px' }} ellipsis>
            {selectedCollections[0].contractInfo?.name}
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
      onBackPress={
        type !== 'bypassMenuWallets' && selectedFilter !== FilterType.menu ? () => handleFilterChange(FilterType.menu) : undefined
      }
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
        <div className="flex flex-col bg-background-primary gap-3">
          {wallets.length > 1 && (
            <ListCardSelect
              key="all"
              isSelected={selectedWalletsObservable.get().length > 1}
              rightChildren={
                <Text color="muted" fontWeight="medium" variant="normal">
                  {fiatCurrency.sign}
                  {totalFiatValue}
                </Text>
              }
              onClick={() => setSelectedWallets([])}
            >
              <MediaIconWrapper iconList={wallets.map(wallet => wallet.address)} size="sm" isAccount />
              <Text color="primary" fontWeight="medium" variant="normal">
                All
              </Text>
            </ListCardSelect>
          )}
          {wallets.map(wallet => (
            <ListCardSelect
              key={wallet.address}
              isSelected={
                selectedWalletsObservable.get().length === 1 &&
                selectedWalletsObservable.get().find(w => w.address === wallet.address) !== undefined
              }
              rightChildren={
                <Text color="muted" fontWeight="medium" variant="normal">
                  {fiatCurrency.sign}
                  {fiatWalletsMap.find(w => w.accountAddress === wallet.address)?.fiatValue}
                </Text>
              }
              onClick={() => setSelectedWallets([wallet])}
            >
              <WalletAccountGradient
                accountAddress={wallet.address}
                loginIcon={getConnectorLogo(wallet.signInMethod)}
                size={'small'}
              />
              <Text color="primary" fontWeight="medium" variant="normal">
                {formatAddress(wallet.address)}
              </Text>
            </ListCardSelect>
          ))}
        </div>
      ) : selectedFilter === FilterType.networks ? (
        <div className="flex flex-col bg-background-primary gap-3">
          {allNetworks.length > 1 && (
            <ListCardSelect
              key="all"
              isSelected={selectedNetworksObservable.get().length > 1}
              onClick={() => setSelectedNetworks([])}
            >
              <MediaIconWrapper
                iconList={allNetworks.map(network => `https://assets.sequence.info/images/networks/medium/${network}.webp`)}
                size="sm"
              />
              <Text color="primary" fontWeight="medium" variant="normal">
                All
              </Text>
            </ListCardSelect>
          )}
          {allNetworks.map(chainId => (
            <NetworkRow
              key={chainId}
              chainId={chainId}
              isSelected={selectedNetworksObservable.get().length === 1 && selectedNetworksObservable.get().includes(chainId)}
              onClick={() => setSelectedNetworks([chainId])}
            />
          ))}
        </div>
      ) : selectedFilter === FilterType.collections ? (
        <div className="flex flex-col bg-background-primary gap-3">
          {collections?.length && collections.length > 1 && (
            <ListCardSelect
              key="all"
              isSelected={selectedCollectionsObservable.get().length === 0}
              onClick={() => setSelectedCollections([])}
            >
              <MediaIconWrapper iconList={collections.map(collection => collection.contractInfo?.logoURI)} size="sm" />
              <Text color="primary" fontWeight="medium" variant="normal">
                All
              </Text>
            </ListCardSelect>
          )}
          {collections?.map(collection => (
            <ListCardSelect
              key={collection.contractAddress}
              isSelected={
                selectedCollectionsObservable.get().find(c => c.contractAddress === collection.contractAddress) !== undefined ||
                collections.length === 1
              }
              onClick={collections.length > 1 ? () => setSelectedCollections([collection]) : undefined}
            >
              <TokenImage src={collection.contractInfo?.logoURI} symbol={collection.contractInfo?.name} />
              <Text color="primary" fontWeight="medium" variant="normal">
                {collection.contractInfo?.name}
              </Text>
            </ListCardSelect>
          ))}
        </div>
      ) : null}
    </SlideupDrawer>
  )
}
