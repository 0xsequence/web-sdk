import { useWallets } from '@0xsequence/connect'
import { ChevronUpDownIcon, Text } from '@0xsequence/design-system'
import { useState } from 'react'

import { SelectWalletRow } from './SelectWalletRow'
import { SlideupDrawer } from './SlideupDrawer'

const WALLET_SELECT_HEIGHT = '60px'

export const WalletSelect = ({ selectedWallet, onClick }: { selectedWallet: string; onClick: (address: string) => void }) => {
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
        <SlideupDrawer label="Wallets" onClose={() => setIsOpen(false)}>
          <div className="flex flex-col gap-2" style={{ overflowY: 'auto' }}>
            {allButActiveWallet.map(wallet => (
              <SelectWalletRow
                key={wallet.address}
                wallet={wallet}
                isSelected={wallet.address === selectedWallet}
                onClick={handleClick}
                onClose={() => setIsOpen(false)}
              />
            ))}
          </div>
        </SlideupDrawer>
      )}
    </div>
  )
}
