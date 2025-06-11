import { useWallets } from '@0xsequence/connect'
import { ChevronUpDownIcon, Text } from '@0xsequence/design-system'
import { useState } from 'react'

import { ListCardWallet } from '../ListCard/ListCardWallet.js'

import { SlideupDrawer } from './SlideupDrawer.js'

const WALLET_SELECT_HEIGHT = '60px'

export const AllButActiveWalletSelect = ({ onClick }: { onClick: (address: string) => void }) => {
  const { wallets } = useWallets()
  const [isOpen, setIsOpen] = useState(false)

  const activeWallet = wallets.find(wallet => wallet.isActive)

  const allButActiveWallet = wallets.filter(wallet => wallet.address !== activeWallet?.address)

  const handleClick = (address: string) => {
    onClick(address)
    setIsOpen(false)
  }

  return (
    <div
      className="flex bg-background-secondary justify-between items-center hover:opacity-80 cursor-pointer rounded-xl px-4 py-3 gap-2 select-none"
      style={{ height: WALLET_SELECT_HEIGHT }}
      onClick={() => setIsOpen(true)}
    >
      <div className="flex flex-col gap-2">
        <Text variant="small" fontWeight="bold" color="muted">
          Select Connected Wallet
        </Text>
      </div>

      <ChevronUpDownIcon className="text-muted" />
      {isOpen && (
        <SlideupDrawer
          header={
            <Text variant="medium" color="primary">
              Wallets
            </Text>
          }
          onClose={() => setIsOpen(false)}
        >
          <div className="flex flex-col gap-2" style={{ overflowY: 'auto' }}>
            {allButActiveWallet.map(wallet => (
              <ListCardWallet key={wallet.address} wallet={wallet} onClick={() => handleClick(wallet.address)} />
            ))}
          </div>
        </SlideupDrawer>
      )}
    </div>
  )
}
