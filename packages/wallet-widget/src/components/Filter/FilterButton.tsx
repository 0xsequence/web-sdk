import { useWallets } from '@0xsequence/connect'
import { GearIcon, cn, cardVariants, Text } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import { useMemo, useState } from 'react'

import { useSettings } from '../../hooks'

import { FilterMenu } from './FilterMenu'

export const FilterButton = ({
  label,
  type
}: {
  label: string
  type: 'tokens' | 'collectibles' | 'transactions' | 'bypassMenuWallets'
}) => {
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
      className={cn(cardVariants({ clickable: true }), 'flex items-center justify-center p-2 relative')}
      style={{ height: '52px', width: '52px' }}
      onClick={() => setIsOpen(true)}
    >
      <GearIcon size="xl" color="white" />
      <div className="absolute top-0 right-0">
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
