import { cardVariants, ChevronUpDownIcon, cn, NetworkImage, Text } from '@0xsequence/design-system'
import { useState } from 'react'
import { useChainId, useChains, useSwitchChain } from 'wagmi'

import { NetworkRow } from '../Filter/NetworkRow.js'

import { SlideupDrawer } from './SlideupDrawer.js'

const NETWORK_SELECT_HEIGHT = '70px'

export const NetworkSelect = () => {
  const chains = useChains()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={cn(
        cardVariants({ clickable: true }),
        'flex justify-between items-center border-1 border-solid rounded-xl px-4 py-3 gap-2 select-none'
      )}
      style={{ height: NETWORK_SELECT_HEIGHT }}
      onClick={() => setIsOpen(true)}
    >
      <div className="flex flex-col gap-2">
        <Text variant="small" fontWeight="bold" color="muted">
          Network
        </Text>
        <div className="flex items-center gap-2">
          <NetworkImage chainId={chainId} size="sm" />
          <Text variant="normal" fontWeight="bold" color="primary">
            {chains.find(chain => chain.id === chainId)?.name || chainId}
          </Text>
        </div>
      </div>

      <ChevronUpDownIcon className="text-muted" />
      {isOpen && (
        <SlideupDrawer label="Network" onClose={() => setIsOpen(false)}>
          <div className="flex flex-col gap-2" style={{ overflowY: 'auto' }}>
            {chains.map(chain => (
              <NetworkRow
                key={chain.id}
                chainId={chain.id}
                isSelected={chain.id === chainId}
                onClick={() => {
                  switchChain({ chainId: chain.id })
                  setIsOpen(false)
                }}
              />
            ))}
          </div>
        </SlideupDrawer>
      )}
    </div>
  )
}
