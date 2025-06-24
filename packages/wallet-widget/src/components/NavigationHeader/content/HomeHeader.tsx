import { useOpenConnectModal, useWallets } from '@0xsequence/connect'
import {
  AddIcon,
  ArrowUpIcon,
  Divider,
  IconButton,
  ScanIcon,
  SearchIcon,
  SettingsIcon,
  SwapIcon,
  Text,
  WalletIcon
} from '@0xsequence/design-system'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

import { useNavigation } from '../../../hooks/useNavigation.js'
import { useSettings } from '../../../hooks/useSettings.js'
import { useValueRegistry } from '../../../hooks/useValueRegistry.js'
import { ListCardWallet } from '../../ListCard/ListCardWallet.js'
import { SlideupDrawer } from '../../Select/SlideupDrawer.js'

export const HomeHeader = () => {
  const { setOpenConnectModal } = useOpenConnectModal()

  const { fiatCurrency } = useSettings()
  const { totalValue } = useValueRegistry()
  const { wallets } = useWallets()
  const [isWalletViewOpen, setIsWalletViewOpen] = useState(false)
  const [isOperationMenuOpen, setIsOperationMenuOpen] = useState(false)

  const { setNavigation } = useNavigation()

  const onClickWallets = () => {
    setIsWalletViewOpen(true)
  }

  const handleManageWallets = () => {
    setIsWalletViewOpen(false)
    setNavigation({
      location: 'settings-wallets'
    })
  }

  const onClickSend = () => {
    setIsOperationMenuOpen(false)
    setNavigation({
      location: 'send-general'
    })
  }

  const onClickSwap = () => {
    setIsOperationMenuOpen(false)
    setNavigation({
      location: 'swap'
    })
  }

  const onClickReceive = () => {
    setIsOperationMenuOpen(false)
    setNavigation({
      location: 'receive'
    })
  }

  const onClickBuy = () => {
    setIsOperationMenuOpen(false)
    setNavigation({
      location: 'buy'
    })
  }

  const onClickSearch = () => {
    setIsOperationMenuOpen(false)
    setNavigation({
      location: 'search'
    })
  }

  const onClickSettings = () => {
    setIsOperationMenuOpen(false)
    setNavigation({
      location: 'settings'
    })
  }

  return (
    <div className="flex flex-col justify-between h-full w-full" style={{ position: 'relative' }}>
      <div className="flex flex-row items-start p-4 gap-3">
        <IconButton className="bg-background-secondary" icon={WalletIcon} size="sm" onClick={() => onClickWallets()} />

        <PopoverPrimitive.Root open={isOperationMenuOpen} onOpenChange={setIsOperationMenuOpen}>
          <PopoverPrimitive.Trigger asChild>
            <IconButton className="bg-background-secondary" icon={SwapIcon} size="sm" />
          </PopoverPrimitive.Trigger>

          {isOperationMenuOpen && (
            <PopoverPrimitive.Content
              className="flex flex-col p-2 gap-2 z-30 rounded-xl border border-border-normal"
              style={{ background: 'rgb(25, 25, 25)' }}
              asChild
              side="bottom"
              sideOffset={8}
              alignOffset={-8}
              align="start"
            >
              <div>
                <div
                  className="flex flex-row items-center py-2 px-4 gap-2 bg-background-secondary rounded-lg hover:opacity-80 cursor-pointer"
                  onClick={() => {
                    onClickSend()
                  }}
                >
                  <ArrowUpIcon color="white" />
                  <Text variant="normal" fontWeight="bold" color="primary">
                    Send
                  </Text>
                </div>
                <div
                  className="flex flex-row items-center py-2 px-4 gap-2 bg-background-secondary rounded-lg hover:opacity-80 cursor-pointer"
                  onClick={() => {
                    onClickSwap()
                  }}
                >
                  <SwapIcon color="white" />
                  <Text variant="normal" fontWeight="bold" color="primary">
                    Swap
                  </Text>
                </div>
                <div
                  className="flex flex-row items-center py-2 px-4 gap-2 bg-background-secondary rounded-lg hover:opacity-80 cursor-pointer"
                  onClick={() => {
                    onClickReceive()
                  }}
                >
                  <ScanIcon color="white" />
                  <Text variant="normal" fontWeight="bold" color="primary">
                    Receive
                  </Text>
                </div>
                <div
                  className="flex flex-row items-center py-2 px-4 gap-2 bg-background-secondary rounded-lg hover:opacity-80 cursor-pointer"
                  onClick={() => {
                    onClickBuy()
                  }}
                >
                  <AddIcon color="white" />
                  <Text variant="normal" fontWeight="bold" color="primary">
                    Buy
                  </Text>
                </div>
              </div>
            </PopoverPrimitive.Content>
          )}
        </PopoverPrimitive.Root>

        <IconButton className="bg-background-secondary" icon={SearchIcon} size="sm" onClick={() => onClickSearch()} />
        <IconButton className="bg-background-secondary" icon={SettingsIcon} size="sm" onClick={() => onClickSettings()} />
      </div>
      <Divider className="my-0 w-full" style={{ position: 'absolute', bottom: 0 }} />

      <AnimatePresence>
        {isWalletViewOpen && (
          <SlideupDrawer
            onClose={() => setIsWalletViewOpen(false)}
            header={
              <div className="flex flex-row justify-between items-center w-full">
                <Text variant="medium" color="primary">
                  Connected Wallets
                </Text>
                <Text variant="small" color="muted">
                  {fiatCurrency.sign}
                  {totalValue} {fiatCurrency.symbol}
                </Text>
              </div>
            }
            footer={
              <div className="flex flex-row w-full gap-3">
                <div
                  className="flex justify-center items-center bg-background-secondary rounded-full py-3 px-4 gap-2 w-full hover:opacity-80 cursor-pointer"
                  onClick={() => setOpenConnectModal(true)}
                >
                  <AddIcon color="white" />
                  <Text variant="normal" fontWeight="bold" color="primary">
                    Add Wallet
                  </Text>
                </div>
                <div
                  className="flex justify-center items-center bg-background-secondary rounded-full py-3 px-4 gap-2 w-full hover:opacity-80 cursor-pointer"
                  onClick={() => handleManageWallets()}
                >
                  <SettingsIcon color="white" />
                  <Text variant="normal" fontWeight="bold" color="primary">
                    Manage
                  </Text>
                </div>
              </div>
            }
          >
            <div className="flex flex-col gap-4">
              {wallets.map(wallet => (
                <ListCardWallet disabled key={wallet.address} wallet={wallet} />
              ))}
            </div>
          </SlideupDrawer>
        )}
      </AnimatePresence>
    </div>
  )
}
