import { Button, Card, ChevronDownIcon, NetworkImage, Text } from '@0xsequence/design-system'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { useState } from 'react'
import { useChainId, useChains, useSwitchChain } from 'wagmi'

import { WALLET_HEIGHT } from './SequenceWalletProvider'

export const NetworkSelect = () => {
  const chains = useChains()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isOpen, toggleOpen] = useState(false)

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={toggleOpen}>
      <PopoverPrimitive.Trigger asChild>
        <div
          className="flex border-1 border-solid rounded-xl px-4 py-3 cursor-pointer gap-2 items-center select-none"
          style={{ height: 52 }}
        >
          <div className="flex items-center gap-2">
            <NetworkImage chainId={chainId} size="sm" />
            <Text variant="normal" fontWeight="bold" color="primary">
              {chains.find(chain => chain.id === chainId)?.name || chainId}
            </Text>
          </div>

          <div className="text-muted">
            <ChevronDownIcon />
          </div>
        </div>
      </PopoverPrimitive.Trigger>
      {isOpen && (
        <PopoverPrimitive.Content side="bottom" sideOffset={8} align="center" asChild>
          <Card className="bg-background-raised backdrop-blur-md relative px-1 py-3" style={{ overflowY: 'hidden' }}>
            <div className="flex flex-col gap-2 px-2 overflow-y-auto" style={{ maxHeight: `calc(${WALLET_HEIGHT} / 2)` }}>
              {chains.map(chain => (
                <div style={{ height: 44 }}>
                  <Button
                    className="w-full"
                    key={chain.id}
                    shape="square"
                    onClick={() => {
                      console.log('chain', chain)
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
