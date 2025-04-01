import { formatAddress, ConnectedWallet } from '@0xsequence/connect'
import { ChevronRightIcon, Text } from '@0xsequence/design-system'
import { cn, cardVariants } from '@0xsequence/design-system'

import { getConnectorLogo } from '../utils/wallets'

import { WalletAccountGradient } from './WalletAccountGradient'

export const SelectWalletRow = ({
  wallet,
  setActiveWallet,
  onClose
}: {
  wallet: ConnectedWallet
  setActiveWallet: (address: string) => void
  onClose: () => void
}) => {
  const onSelectWallet = () => {
    setActiveWallet(wallet.address)
    onClose()
  }

  return (
    <div
      key={wallet.address}
      className={cn(
        cardVariants({ clickable: true }),
        'flex flex-row justify-between  items-center p-3',
        wallet.isActive ? 'bg-background-secondary' : 'bg-background-muted'
      )}
      onClick={onSelectWallet}
    >
      <div className="flex flex-row gap-2 items-center">
        <WalletAccountGradient accountAddress={wallet.address} loginIcon={getConnectorLogo(wallet.signInMethod)} size={'small'} />
        <div className="flex flex-col">
          <Text color="primary" fontWeight="medium" variant="normal">
            {formatAddress(wallet.address)}
          </Text>
          <Text color="primary" fontWeight="medium" variant="small">
            {wallet.id}
          </Text>
        </div>
      </div>
      <ChevronRightIcon color="white" />
    </div>
  )
}
