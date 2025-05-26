import { ChevronDownIcon, Text } from '@0xsequence/design-system'
import { cn } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

import { SlideupDrawer } from '../Select/SlideupDrawer.js'

import { CollectionsFilter } from './CollectionsFilter.js'
import { NetworksFilter } from './NetworksFilter.js'
import { WalletsFilter } from './WalletsFilter.js'

export const FilterOptions = ({ filterType }: { filterType: 'wallets' | 'networks' | 'collections' }) => {
  const [openType, setOpenType] = useState<'closed' | 'wallets' | 'networks' | 'collections'>('closed')

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
        <Text variant="normal" fontWeight="bold" color="primary">
          {filterType === 'networks' ? 'All Networks' : filterType === 'collections' ? 'Items' : 'Wallets'}
        </Text>
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
