import { Button, Card, cardVariants, ChevronDownIcon, cn, NetworkImage, Text } from '@0xsequence/design-system'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { useState } from 'react'
import { useChainId, useChains, useSwitchChain } from 'wagmi'

import { WALLET_HEIGHT, WALLET_WIDTH } from './SequenceWalletProvider'

const NETWORK_SELECT_HEIGHT = 70
export const NetworkSelect = () => {
  const chains = useChains()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isOpen, toggleOpen] = useState(false)

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={toggleOpen}>
      <PopoverPrimitive.Trigger asChild>
        <div
          className={cn(
            cardVariants({ clickable: true }),
            'flex justify-between items-center border-1 border-solid rounded-xl px-4 py-3 gap-2 select-none'
          )}
          style={{ height: NETWORK_SELECT_HEIGHT }}
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

          <ChevronDownIcon className="text-muted" />
        </div>
      </PopoverPrimitive.Trigger>
      {isOpen && (
        <PopoverPrimitive.Content
          side="bottom"
          sideOffset={-NETWORK_SELECT_HEIGHT}
          align="center"
          asChild
          style={{ width: `calc(min(${WALLET_WIDTH}, 100vw) - 32px)` }}
        >
          <Card className="bg-background-raised backdrop-blur-md relative px-1 py-3 z-30" style={{ overflowY: 'hidden' }}>
            <div className="flex flex-col gap-2 px-2" style={{ maxHeight: `calc(${WALLET_HEIGHT} / 2)`, overflowY: 'auto' }}>
              {chains.map(chain => (
                <div key={chain.id} style={{ height: '44px' }}>
                  <Button
                    className="w-full"
                    shape="square"
                    onClick={() => {
                      switchChain({ chainId: chain.id })
                      toggleOpen(false)
                    }}
                    leftIcon={() => <NetworkImage chainId={chain.id} size="sm" />}
                    label={
                      <div className="flex items-center gap-2">
                        <Text variant="normal" fontWeight="bold" color="primary">
                          {chain.name}
                        </Text>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          </Card>
        </PopoverPrimitive.Content>
      )}
    </PopoverPrimitive.Root>
  )
}
