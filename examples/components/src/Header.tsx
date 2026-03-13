import { networks, truncateAtIndex } from '@0xsequence/connect'
import {
  Button,
  Card,
  CheckmarkIcon,
  ChevronDownIcon,
  GradientAvatar,
  Image,
  MoonIcon,
  NetworkImage,
  SearchIcon,
  SignoutIcon,
  SunIcon,
  Text,
  TextInput,
  useTheme
} from '@0xsequence/design-system'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { useMemo, useState } from 'react'
import { useChainId, useChains, useConnection, useDisconnect, useSwitchChain } from 'wagmi'

export const Header = () => {
  const { theme, setTheme } = useTheme()
  const normalizedTheme: 'light' | 'dark' = theme === 'light' ? 'light' : 'dark'

  return (
    <div className="flex fixed top-0 w-full p-4 justify-between bg-background-primary backdrop-blur-md z-3 border-b border-border-normal">
      <div className="flex flex-row items-center justify-center gap-3">
        <Image
          src={theme === 'dark' ? 'images/sequence-websdk-dark.svg' : 'images/sequence-websdk-light.svg'}
          alt="Sequence Web SDK Logo"
        />
      </div>
      <div className="flex gap-2 items-center">
        <Button onClick={() => setTheme(normalizedTheme === 'dark' ? 'light' : 'dark')} variant="ghost" size="sm">
          {normalizedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </Button>
        <NetworkSelect />
        <AccountMenu />
      </div>
    </div>
  )
}

const AccountMenu = () => {
  const [isOpen, toggleOpen] = useState(false)
  const { address, connector } = useConnection()
  const disconnect = useDisconnect()

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={toggleOpen}>
      <PopoverPrimitive.Trigger asChild>
        <div
          className="flex border-1 border-solid border-border-normal bg-background-secondary rounded-xl px-4 py-3 cursor-pointer gap-2 items-center select-none"
          style={{ height: 52 }}
        >
          <div className="flex flex-col">
            <div className="flex flex-row gap-2 justify-end items-center">
              <GradientAvatar address={String(address)} size="sm" />
              <Text variant="normal" fontWeight="bold" color="primary">
                {truncateAtIndex(String(address), 8)}
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
          <PopoverPrimitive.Content className="bg-background-raised!" side="bottom" sideOffset={8} align="end" asChild>
            <Card className="z-20 backdrop-blur-md relative p-2" style={{ minWidth: 360 }}>
              <Card className="bg-muted/20">
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
                <Button className="w-full justify-between" shape="square" variant="secondary" onClick={() => disconnect.mutate()}>
                  Sign out
                  <SignoutIcon />
                </Button>
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
  const [searchQuery, setSearchQuery] = useState('')

  chains.forEach(chain => {
    if (chain.id === 8453) {
      chain.name = 'Base'
    }
  })

  const { mainnets, testnets } = useMemo(() => {
    const filtered = chains.filter(chain => chain.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const mainnets = filtered.filter(chain => {
      const sequenceNetwork = networks[chain.id]
      return !sequenceNetwork?.testnet
    })

    const testnets = filtered.filter(chain => {
      const sequenceNetwork = networks[chain.id]
      return sequenceNetwork?.testnet
    })

    return {
      mainnets,
      testnets
    }
  }, [chains, searchQuery])

  const currentChain = chains.find(chain => chain.id === chainId)

  return (
    <PopoverPrimitive.Root
      open={isOpen}
      onOpenChange={open => {
        toggleOpen(open)
        if (!open) {
          setSearchQuery('')
        }
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <div
          className="flex border-1 border-solid border-border-normal bg-background-secondary rounded-xl px-4 py-3 cursor-pointer gap-2 items-center select-none"
          style={{ height: 52 }}
        >
          <div className="flex items-center gap-2">
            <NetworkImage chainId={chainId} size="sm" />
            <Text className="hidden md:block" variant="normal" fontWeight="bold" color="primary">
              {currentChain?.name || chainId}
            </Text>
          </div>

          <div className="text-muted">
            <ChevronDownIcon />
          </div>
        </div>
      </PopoverPrimitive.Trigger>
      {isOpen && (
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content className="p-3 shadow-lg" side="bottom" sideOffset={8} align="end" asChild>
            <Card
              className="flex z-20 bg-background-raised backdrop-blur-md relative flex-col overflow-hidden"
              style={{ width: 320 }}
            >
              <div className="mb-3">
                <Text variant="normal" fontWeight="bold" color="primary" className="mb-2">
                  All networks
                </Text>
                <div className="relative">
                  <TextInput
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    placeholder="Search networks"
                    leftIcon={SearchIcon}
                    className="w-full pr-10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {mainnets.length > 0 && (
                  <div>
                    <Text variant="small" fontWeight="medium" color="secondary" className="mb-2 px-1">
                      Mainnets
                    </Text>
                    <div className="flex flex-col">
                      {mainnets.map(chain => (
                        <Button
                          className="w-full min-h-[44px] h-12 justify-between"
                          key={chain.id}
                          variant={'ghost'}
                          shape="square"
                          onClick={() => {
                            switchChain({ chainId: chain.id })
                            toggleOpen(false)
                            setSearchQuery('')
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <NetworkImage chainId={chain.id} size="sm" />
                            <Text variant="normal" fontWeight="bold">
                              {chain.name}
                            </Text>
                          </div>

                          {chain.id === chainId && <CheckmarkIcon />}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {testnets.length > 0 && (
                  <div>
                    <Text variant="small" fontWeight="medium" color="secondary" className="mb-2 px-1">
                      Testnets
                    </Text>
                    <div className="flex flex-col">
                      {testnets.map(chain => (
                        <Button
                          className="w-full min-h-[44px] h-12 justify-between"
                          key={chain.id}
                          variant={'ghost'}
                          shape="square"
                          onClick={() => {
                            switchChain({ chainId: chain.id })
                            toggleOpen(false)
                            setSearchQuery('')
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <NetworkImage chainId={chain.id} size="sm" />
                            <Text variant="normal" fontWeight="bold">
                              {chain.name}
                            </Text>
                          </div>

                          {chain.id === chainId && <CheckmarkIcon />}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {mainnets.length === 0 && testnets.length === 0 && (
                  <div className="py-8 text-center">
                    <Text variant="normal" color="secondary">
                      No networks found
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      )}
    </PopoverPrimitive.Root>
  )
}
