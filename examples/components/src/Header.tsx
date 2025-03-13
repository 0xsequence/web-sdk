import {
  Image,
  Text,
  GradientAvatar,
  truncateAddress,
  NetworkImage,
  Card,
  Button,
  ChevronDownIcon,
  SignoutIcon
} from '@0xsequence/design-system'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { useState } from 'react'
import { useAccount, useChainId, useChains, useDisconnect, useSwitchChain } from 'wagmi'

export const Header = () => {
  return (
    <div
      className="flex fixed top-0 w-full p-4 justify-between bg-background-overlay backdrop-blur-md z-3"
      style={{ borderBottom: '1px solid #222' }}
    >
      <div className="flex flex-row items-center justify-center gap-3">
        <Image style={{ width: '36px' }} src="images/kit-logo.svg" alt="Sequence kit" disableAnimation />
        <Image
          style={{
            width: '24px'
            // filter: theme === 'dark' ? 'invert(0)' : 'invert(1)'
          }}
          src="images/kit-logo-text.svg"
          alt="Sequence Web SDK Text Logo"
          disableAnimation
        />
      </div>
      <div className="flex gap-2 items-center">
        <NetworkSelect />
        <AccountMenu />
      </div>
    </div>
  )
}

const AccountMenu = () => {
  const [isOpen, toggleOpen] = useState(false)
  const { address, connector } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={toggleOpen}>
      <PopoverPrimitive.Trigger asChild>
        <div
          className="flex border-1 border-solid rounded-xl px-4 py-3 cursor-pointer gap-2 items-center select-none"
          style={{ height: 52 }}
        >
          <div className="flex flex-col">
            <div className="flex flex-row gap-2 justify-end items-center">
              <GradientAvatar address={String(address)} size="sm" />
              <Text variant="normal" fontWeight="bold" color="primary">
                {truncateAddress(String(address), 4)}
              </Text>
            </div>
          </div>

          <div className="text-muted">
            <ChevronDownIcon />
          </div>
        </div>
      </PopoverPrimitive.Trigger>
      {isOpen && (
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content side="bottom" sideOffset={8} align="end" asChild>
            <Card className="z-20 bg-background-raised backdrop-blur-md relative p-2" style={{ minWidth: 360 }}>
              <Card>
                <div className="flex items-center justify-between">
                  <Text variant="normal" fontWeight="bold" color="primary">
                    Account
                  </Text>
                  <Text variant="small" color="muted">
                    {connector?.name}
                  </Text>
                </div>

                <Text className="mt-2" variant="normal" color="secondary" asChild>
                  <div>{address}</div>
                </Text>
              </Card>

              <div className="mt-2">
                <Button
                  className="w-full"
                  shape="square"
                  variant="emphasis"
                  rightIcon={SignoutIcon}
                  label="Sign out"
                  onClick={() => disconnect()}
                />
              </div>
            </Card>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      )}
    </PopoverPrimitive.Root>
  )
}

const NetworkSelect = () => {
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
            <Text display={{ sm: 'none', lg: 'block' }} variant="normal" fontWeight="bold" color="primary">
              {chains.find(chain => chain.id === chainId)?.name || chainId}
            </Text>
          </div>

          <div className="text-muted">
            <ChevronDownIcon />
          </div>
        </div>
      </PopoverPrimitive.Trigger>
      {isOpen && (
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content side="bottom" sideOffset={8} align="end" asChild>
            <Card className="flex z-20 bg-background-raised backdrop-blur-md relative p-2 flex-col gap-2">
              {chains.map(chain => (
                <Button
                  className="w-full"
                  key={chain.id}
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
              ))}
            </Card>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      )}
    </PopoverPrimitive.Root>
  )
}
