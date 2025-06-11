import { useWallets, type ConnectedWallet } from '@0xsequence/connect'
import { useObservable } from 'micro-observables'

import { useSettings } from '../../hooks/index.js'
import { ListCardWallet } from '../ListCard/ListCardWallet.js'

export const WalletsFilter = ({ onClose }: { onClose: () => void }) => {
  const { selectedWalletsObservable, setSelectedWallets } = useSettings()
  const { wallets } = useWallets()

  const selectedWallets = useObservable(selectedWalletsObservable)

  const onWalletClick = (wallet?: ConnectedWallet) => {
    if (wallet) {
      setSelectedWallets([wallet])
    } else {
      setSelectedWallets([])
    }
    onClose()
  }

  return (
    <div className="flex flex-col bg-background-primary gap-3">
      {wallets.map(wallet => (
        <ListCardWallet
          isSelected={selectedWallets.length === 1 && selectedWallets.some(w => w.address === wallet.address)}
          key={wallet.address}
          wallet={wallet}
          onClick={() => onWalletClick(wallet)}
        />
      ))}
    </div>
  )
}
