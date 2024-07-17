import {
  Box,
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
    <Box
      position="fixed"
      top="0"
      width="full"
      padding="4"
      justifyContent="space-between"
      background="backgroundOverlay"
      backdropFilter="blur"
      zIndex="1"
      style={{ borderBottom: '1px solid #222' }}
    >
      <Box flexDirection="row" alignItems="center" justifyContent="center" gap="3">
        <Image style={{ width: '36px' }} src="images/kit-logo.svg" alt="Sequence kit" disableAnimation />
        <Image
          style={{
            width: '24px'
            // filter: theme === 'dark' ? 'invert(0)' : 'invert(1)'
          }}
          src="images/kit-logo-text.svg"
          alt="Sequence Kit Text Logo"
          disableAnimation
        />
      </Box>
      <Box gap="2" alignItems="center">
        <NetworkSelect />
        <AccountMenu />
      </Box>
    </Box>
  )
}

const AccountMenu = () => {
  const [isOpen, toggleOpen] = useState(false)
  const { address, connector } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={toggleOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Box
          borderColor={isOpen ? 'borderFocus' : 'borderNormal'}
          borderWidth="thin"
          borderStyle="solid"
          borderRadius="md"
          paddingX="4"
          paddingY="3"
          cursor="pointer"
          gap="2"
          alignItems="center"
          userSelect="none"
          opacity={{ hover: '80' }}
          style={{ height: 52 }}
        >
          <Box flexDirection="column">
            <Box flexDirection="row" gap="2" justifyContent="flex-end" alignItems="center">
              <GradientAvatar address={String(address)} size="sm" />
              <Text variant="normal" fontWeight="bold" color="text100">
                {truncateAddress(String(address), 4)}
              </Text>
            </Box>
          </Box>

          <Box color="text50">
            <ChevronDownIcon />
          </Box>
        </Box>
      </PopoverPrimitive.Trigger>

      {isOpen && (
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content side="bottom" sideOffset={8} align="end" asChild>
            <Card
              zIndex="20"
              background="backgroundRaised"
              backdropFilter="blur"
              position="relative"
              padding="2"
              style={{ minWidth: 360 }}
            >
              <Card>
                <Box alignItems="center" justifyContent="space-between">
                  <Text variant="normal" fontWeight="bold" color="text100">
                    Account
                  </Text>
                  <Text variant="small" color="text50">
                    {connector?.name}
                  </Text>
                </Box>

                <Text as="div" marginTop="2" variant="normal" color="text80">
                  {address}
                </Text>
              </Card>

              <Box marginTop="2">
                <Button
                  width="full"
                  shape="square"
                  variant="emphasis"
                  rightIcon={SignoutIcon}
                  label="Sign out"
                  onClick={() => disconnect()}
                />
              </Box>
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
        <Box
          borderColor={isOpen ? 'borderFocus' : 'borderNormal'}
          borderWidth="thin"
          borderStyle="solid"
          borderRadius="md"
          paddingX="4"
          paddingY="3"
          cursor="pointer"
          gap="2"
          alignItems="center"
          userSelect="none"
          opacity={{ hover: '80' }}
          style={{ height: 52 }}
        >
          <Box alignItems="center" gap="2">
            <NetworkImage chainId={chainId} size="sm" />
            <Text display={{ sm: 'none', lg: 'block' }} variant="normal" fontWeight="bold" color="text100">
              {chains.find(chain => chain.id === chainId)?.name || chainId}
            </Text>
          </Box>

          <Box color="text50">
            <ChevronDownIcon />
          </Box>
        </Box>
      </PopoverPrimitive.Trigger>

      {isOpen && (
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content side="bottom" sideOffset={8} align="end" asChild>
            <Card
              zIndex="20"
              background="backgroundRaised"
              backdropFilter="blur"
              position="relative"
              padding="2"
              flexDirection="column"
              gap="2"
            >
              {chains.map(chain => (
                <Button
                  key={chain.id}
                  width="full"
                  shape="square"
                  onClick={() => {
                    switchChain({ chainId: chain.id })
                    toggleOpen(false)
                  }}
                  leftIcon={() => <NetworkImage chainId={chain.id} size="sm" />}
                  label={
                    <Box alignItems="center" gap="2">
                      <Text variant="normal" fontWeight="bold" color="text100">
                        {chain.name}
                      </Text>
                    </Box>
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
