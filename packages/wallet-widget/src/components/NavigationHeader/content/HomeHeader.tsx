import { useOpenConnectModal, useWallets } from '@0xsequence/connect'
import { AddIcon, Divider, IconButton, SearchIcon, SettingsIcon, SwapIcon, Text, WalletIcon } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

import { useFiatWalletsMap } from '../../../hooks/useFiatWalletsMap.js'
import { useNavigation } from '../../../hooks/useNavigation.js'
import { useSettings } from '../../../hooks/useSettings.js'
import { ListCardWallet } from '../../ListCard/ListCardWallet.js'
import { SlideupDrawer } from '../../Select/SlideupDrawer.js'

export const HomeHeader = () => {
  const { fiatCurrency } = useSettings()
  const { totalFiatValue } = useFiatWalletsMap()
  const { wallets } = useWallets()
  const [isWalletViewOpen, setIsWalletViewOpen] = useState(false)

  const { setOpenConnectModal } = useOpenConnectModal()

  const onClickWalletIcon = () => {}

  const onClickSwapIcon = () => {}

  return (
    <div className="flex flex-col justify-between h-full w-full" style={{ position: 'relative' }}>
      <div className="flex flex-row items-start p-4 gap-3">
        <IconButton className="bg-background-secondary" icon={WalletIcon} size="sm" onClick={() => setIsWalletViewOpen(true)} />
        <IconButton className="bg-background-secondary" icon={SwapIcon} size="sm" />
        <IconButton className="bg-background-secondary" icon={SearchIcon} size="sm" />
        <IconButton className="bg-background-secondary" icon={SettingsIcon} size="sm" />
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
                  {totalFiatValue} {fiatCurrency.symbol}
                </Text>
              </div>
            }
            footer={
              <div className="flex flex-row w-full gap-3">
                <div
                  onClick={() => setOpenConnectModal(true)}
                  className="flex justify-center items-center bg-background-secondary rounded-full py-3 px-4 gap-2 w-full hover:opacity-80 cursor-pointer"
                >
                  <AddIcon color="white" />
                  <Text variant="normal" fontWeight="bold" color="primary">
                    Add Wallet
                  </Text>
                </div>
                <div className="flex justify-center items-center bg-background-secondary rounded-full py-3 px-4 gap-2 w-full hover:opacity-80 cursor-pointer">
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
                <ListCardWallet key={wallet.address} wallet={wallet} />
              ))}
            </div>
          </SlideupDrawer>
        )}
      </AnimatePresence>
    </div>
  )
}
