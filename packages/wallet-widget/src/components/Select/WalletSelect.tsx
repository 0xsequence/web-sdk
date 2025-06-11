import { truncateAtIndex, useWallets } from '@0xsequence/connect'
import { ChevronUpDownIcon, GradientAvatar, Text } from '@0xsequence/design-system'
import { useState } from 'react'

import { ListCardWallet } from '../ListCard/ListCardWallet.js'

import { SlideupDrawer } from './SlideupDrawer.js'

const WALLET_SELECT_HEIGHT = '60px'

export const WalletSelect = ({ selectedWallet, onClick }: { selectedWallet: string; onClick: (address: string) => void }) => {
  const { wallets } = useWallets()
  const [isOpen, setIsOpen] = useState(false)

  const activeWallet = wallets.find(wallet => wallet.isActive)

  const walletOptions = wallets

  const handleClick = (address: string) => {
    onClick(address)
    setIsOpen(false)
  }

  return (
    <div
      className="flex bg-background-secondary justify-between items-center hover:opacity-80 cursor-pointer rounded-xl px-4 py-3 gap-2 select-none w-full"
      style={{ height: WALLET_SELECT_HEIGHT }}
      onClick={() => setIsOpen(true)}
    >
      <div className="flex flex-col gap-2">
        <Text variant="small" fontWeight="bold" color="muted">
          Wallet
        </Text>
        <div className="flex flex-row items-center gap-2">
          <GradientAvatar address={activeWallet?.address || ''} size="xs" />
          <Text variant="normal" fontWeight="bold" color="primary">
            {truncateAtIndex(activeWallet?.address || '', 21)}
          </Text>
        </div>
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
            {walletOptions.map(wallet => (
              <ListCardWallet
                key={wallet.address}
                wallet={wallet}
                isSelected={wallet.address === selectedWallet}
                onClick={() => handleClick(wallet.address)}
              />
            ))}
          </div>
        </SlideupDrawer>
      )}
    </div>
  )
}
