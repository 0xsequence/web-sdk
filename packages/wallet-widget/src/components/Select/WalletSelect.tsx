import { truncateAtIndex, useWallets } from '@0xsequence/connect'
import { ChevronUpDownIcon, cn, GradientAvatar, Text } from '@0xsequence/design-system'
import { useState } from 'react'

import { ListCardWallet } from '../ListCard/ListCardWallet.js'

import { SlideupDrawer } from './SlideupDrawer.js'

const WALLET_SELECT_HEIGHT = '60px'

export const WalletSelect = ({
  selectedWallet,
  disabled = false,
  onClick
}: {
  selectedWallet: string
  disabled?: boolean
  onClick: (address: string) => void
}) => {
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
      className={cn(
        'flex bg-background-secondary justify-between items-center rounded-xl px-4 py-3 gap-2 select-none w-full',
        disabled ? 'opacity-75' : 'hover:opacity-80 cursor-pointer'
      )}
      style={{ height: WALLET_SELECT_HEIGHT }}
      onClick={() => !disabled && setIsOpen(true)}
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
