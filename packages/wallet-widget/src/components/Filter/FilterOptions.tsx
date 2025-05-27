import { useWallets } from '@0xsequence/connect'
import { ChevronDownIcon, Text } from '@0xsequence/design-system'
import { cn } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

import { useSettings } from '../../hooks/index.js'
import { SlideupDrawer } from '../Select/SlideupDrawer.js'

import { CollectionsFilter } from './CollectionsFilter.js'
import { NetworksFilter } from './NetworksFilter.js'
import { WalletsFilter } from './WalletsFilter.js'

export const FilterOptions = ({ filterType }: { filterType: 'wallets' | 'networks' | 'collections' }) => {
  const { wallets } = useWallets()
  const { selectedWallets, selectedNetworks, showCollections, allNetworks } = useSettings()
  const [openType, setOpenType] = useState<'closed' | 'wallets' | 'networks' | 'collections'>('closed')

  const filterLabel = () => {
    if (filterType === 'networks') {
      if (selectedNetworks.length === allNetworks.length) {
        return (
          <Text variant="normal" fontWeight="bold" color="primary">
            All Networks
          </Text>
        )
      }
      return (
        <div className="flex flex-row gap-1">
          <Text variant="normal" fontWeight="bold" color="primary">
            Networks
          </Text>
          <Text variant="normal" fontWeight="bold" color="muted">
            {`(${selectedNetworks.length})`}
          </Text>
        </div>
      )
    } else if (filterType === 'wallets') {
      if (selectedWallets.length === wallets.length) {
        return (
          <Text variant="normal" fontWeight="bold" color="primary">
            All Wallets
          </Text>
        )
      }
      return (
        <div className="flex flex-row gap-1">
          <Text variant="normal" fontWeight="bold" color="primary">
            Wallets
          </Text>
          <Text variant="normal" fontWeight="bold" color="muted">
            {`(${selectedWallets.length})`}
          </Text>
        </div>
      )
    } else if (filterType === 'collections') {
      if (showCollections) {
        return (
          <Text variant="normal" fontWeight="bold" color="primary">
            Collections
          </Text>
        )
      }
      return (
        <Text variant="normal" fontWeight="bold" color="primary">
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
      <div
        className={cn(
          `flex flex-row justify-between items-center bg-background-secondary hover:opacity-80 cursor-pointer w-fit rounded-full py-2 px-4 gap-2`
        )}
        style={{ height: '36px' }}
      >
        {filterLabel()}
        <ChevronDownIcon color="white" size="sm" />
      </div>
      <AnimatePresence>
        {openType !== 'closed' && (
          <SlideupDrawer
            onClose={() => setOpenType('closed')}
            label={filterType === 'networks' ? 'Networks' : filterType === 'collections' ? 'Collections' : 'Wallets'}
          >
            {filterType === 'networks' && <NetworksFilter />}
            {filterType === 'collections' && <CollectionsFilter />}
            {filterType === 'wallets' && <WalletsFilter onClose={() => setOpenType('closed')} />}
          </SlideupDrawer>
        )}
      </AnimatePresence>
    </div>
  )
}
