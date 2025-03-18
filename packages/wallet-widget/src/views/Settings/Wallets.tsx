import { formatAddress, useWallets } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'
import { useObservable } from 'micro-observables'

import { GradientAvatarList } from '../../components/GradientAvatarList'
import { SelectRow } from '../../components/SelectRow/SelectRow'
import { WalletAccountGradient } from '../../components/WalletAccountGradient'
import { useSettings } from '../../hooks'
import { getConnectorLogo } from '../../utils/wallets'

export const SettingsWallets = () => {
  const { wallets } = useWallets()
  const { selectedWalletsObservable, setSelectedWallets } = useSettings()
  const selectedWallets = useObservable(selectedWalletsObservable)

  return (
    <div className="flex flex-col pb-5 px-4 pt-3 gap-2">
      {wallets.length > 1 && (
        <SelectRow key="all" isSelected={selectedWallets.length > 1} onClick={() => setSelectedWallets([])}>
          <GradientAvatarList accountAddressList={wallets.map(wallet => wallet.address)} size="md" />
          <Text color="primary" fontWeight="medium" variant="normal">
            All
          </Text>
        </SelectRow>
      )}
      {wallets.map(wallet => (
        <SelectRow
          key={wallet.address}
          isSelected={selectedWallets.length === 1 && selectedWallets.find(w => w.address === wallet.address) !== undefined}
          onClick={() => setSelectedWallets([wallet])}
        >
          <WalletAccountGradient
            accountAddress={wallet.address}
            loginIcon={getConnectorLogo(wallet.signInMethod)}
            size={'small'}
          />
          <Text color="primary" fontWeight="medium" variant="normal">
            {formatAddress(wallet.address)}
          </Text>
        </SelectRow>
      ))}
    </div>
  )
}
