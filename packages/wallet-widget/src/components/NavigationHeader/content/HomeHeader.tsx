import { useWallets } from '@0xsequence/connect'
import { Divider, IconButton, SearchIcon, SettingsIcon, SwapIcon, WalletIcon } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

import { useNavigation } from '../../../hooks/useNavigation.js'
import { ListCardWallet } from '../../ListCard/ListCardWallet.js'
import { SlideupDrawer } from '../../Select/SlideupDrawer.js'

export const HomeHeader = () => {
  const { wallets } = useWallets()
  const { setNavigation } = useNavigation()
  const [isWalletViewOpen, setIsWalletViewOpen] = useState(false)

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
          <SlideupDrawer onClose={() => setIsWalletViewOpen(false)} label="Connected Wallets">
            {wallets.map(wallet => (
              <ListCardWallet key={wallet.address} wallet={wallet} />
            ))}
          </SlideupDrawer>
        )}
      </AnimatePresence>
    </div>
  )
}
