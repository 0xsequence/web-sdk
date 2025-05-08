import { useWallets } from '@0xsequence/connect'
import { cardVariants, cn, FilterIcon, Text } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import { useMemo, useState } from 'react'

import { useSettings } from '../../hooks/index.js'

import { FilterMenu } from './FilterMenu.js'

export const FilterButton = ({ label, type }: { label: string; type: 'tokens' | 'collectibles' | 'transactions' }) => {
  const { wallets } = useWallets()
  const { selectedWallets, selectedNetworks, selectedCollections, allNetworks } = useSettings()
  const [isOpen, setIsOpen] = useState(false)

  const howManyModifiedFilters = useMemo(() => {
    const isModifiedWallets = Number(selectedWallets.length !== wallets.length)
    const isModifiedNetworks = Number(selectedNetworks.length !== allNetworks.length)
    const isModifiedCollections = Number(selectedCollections.length !== 0)

    return isModifiedWallets + isModifiedNetworks + isModifiedCollections
  }, [selectedWallets, wallets, selectedNetworks, allNetworks, selectedCollections])

  return (
    <div
      className={cn(cardVariants({ clickable: true }), 'flex items-center justify-center relative overflow-visible')}
      style={{ height: '52px', width: '52px' }}
      onClick={() => setIsOpen(true)}
    >
      <FilterIcon size="sm" color="white" />
      <div className="absolute" style={{ top: '-5px', right: '-10px' }}>
        {howManyModifiedFilters > 0 && (
          <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: '#0076CC' }}>
            <Text variant="small" color="white">
              {howManyModifiedFilters}
            </Text>
          </div>
        )}
      </div>

      <AnimatePresence>{isOpen && <FilterMenu onClose={() => setIsOpen(false)} label={label} type={type} />}</AnimatePresence>
    </div>
  )
}
