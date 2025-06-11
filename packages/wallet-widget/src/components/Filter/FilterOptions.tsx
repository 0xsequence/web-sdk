import { useWallets } from '@0xsequence/connect'
import { ChevronDownIcon, Text } from '@0xsequence/design-system'
import { useObservable } from 'micro-observables'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

import { useSettings } from '../../hooks/index.js'
import { MiniButton } from '../MiniButton.js'
import { SlideupDrawer } from '../Select/SlideupDrawer.js'

import { CollectionsFilter } from './CollectionsFilter.js'
import { NetworksFilter } from './NetworksFilter.js'
import { WalletsFilter } from './WalletsFilter.js'

const FilterHeader = ({
  allSelectedText,
  fewSelectedText,
  fewSelectedCount,
  clearCondition,
  onClickClear
}: {
  allSelectedText: string
  fewSelectedText: string
  fewSelectedCount: number
  clearCondition: boolean
  onClickClear: () => void
}) => {
  return (
    <div className="flex flex-row justify-between items-center w-full">
      {clearCondition ? (
        <div style={{ whiteSpace: 'nowrap' }}>
          <Text variant="medium" color="primary">
            {fewSelectedText}{' '}
          </Text>
          <Text variant="medium" color="muted">
            ({fewSelectedCount})
          </Text>
        </div>
      ) : (
        <Text variant="medium" color="primary">
          {allSelectedText}
        </Text>
      )}
      {clearCondition && (
        <div
          className="flex justify-center items-center bg-background-secondary rounded-full py-1 px-3 gap-2 w-fit hover:opacity-80 cursor-pointer"
          onClick={() => {
            onClickClear()
          }}
        >
          <Text variant="small" fontWeight="bold" color="primary">
            Clear
          </Text>
        </div>
      )}
    </div>
  )
}

export const FilterOptions = ({ filterType }: { filterType: 'wallets' | 'networks' | 'collections' }) => {
  const { wallets } = useWallets()
  const {
    allNetworks,
    selectedWalletsObservable,
    selectedNetworksObservable,
    showCollectionsObservable,
    setSelectedWallets,
    setSelectedNetworks
  } = useSettings()
  const [openType, setOpenType] = useState<'closed' | 'wallets' | 'networks' | 'collections'>('closed')

  const selectedNetworks = useObservable(selectedNetworksObservable)
  const selectedWallets = useObservable(selectedWalletsObservable)
  const showCollections = useObservable(showCollectionsObservable)

  const filterLabel = () => {
    if (filterType === 'networks') {
      if (selectedNetworks.length === allNetworks.length) {
        return (
          <Text className="truncate" variant="small-bold" color="primary" nowrap>
            All networks
          </Text>
        )
      }
      return (
        <div className="flex flex-row gap-1">
          <Text variant="small-bold" color="primary">
            Networks
          </Text>
          <Text variant="small-bold" color="muted">
            {`(${selectedNetworks.length})`}
          </Text>
        </div>
      )
    } else if (filterType === 'wallets') {
      return (
        <div className="flex flex-row gap-1">
          <Text variant="small-bold" color="primary">
            Wallets
          </Text>
          {selectedWallets.length !== wallets.length && (
            <Text variant="small-bold" color="muted">
              {`(${selectedWallets.length})`}
            </Text>
          )}
        </div>
      )
    } else if (filterType === 'collections') {
      if (showCollections) {
        return (
          <Text variant="small-bold" color="primary">
            Collections
          </Text>
        )
      }
      return (
        <Text variant="small-bold" color="primary">
          Items
        </Text>
      )
    }
  }

  const setOpen = () => {
    if (openType === 'closed') {
      setOpenType(filterType)
    }
  }

  return (
    <div onClick={() => setOpen()}>
      <MiniButton className="h-8">
        {filterLabel()}
        <ChevronDownIcon color="white" size="sm" />
      </MiniButton>
      <AnimatePresence>
        {openType === 'networks' && (
          <SlideupDrawer
            header={
              <FilterHeader
                allSelectedText="All Networks"
                fewSelectedText="Networks"
                fewSelectedCount={selectedNetworks.length}
                clearCondition={selectedNetworks.length !== allNetworks.length}
                onClickClear={() => {
                  setSelectedNetworks([])
                  setOpenType('closed')
                }}
              />
            }
            onClose={() => setOpenType('closed')}
          >
            <NetworksFilter />
          </SlideupDrawer>
        )}
        {openType === 'wallets' && (
          <SlideupDrawer
            header={
              <FilterHeader
                allSelectedText="All Wallets"
                fewSelectedText="Wallets"
                fewSelectedCount={selectedWallets.length}
                clearCondition={selectedWallets.length !== wallets.length}
                onClickClear={() => {
                  setSelectedWallets([])
                  setOpenType('closed')
                }}
              />
            }
            onClose={() => setOpenType('closed')}
          >
            <WalletsFilter onClose={() => setOpenType('closed')} />
          </SlideupDrawer>
        )}
        {openType === 'collections' && (
          <SlideupDrawer
            header={
              <Text variant="medium" color="primary">
                Collectibles
              </Text>
            }
            onClose={() => setOpenType('closed')}
          >
            <CollectionsFilter onClose={() => setOpenType('closed')} />
          </SlideupDrawer>
        )}
      </AnimatePresence>
    </div>
  )
}
