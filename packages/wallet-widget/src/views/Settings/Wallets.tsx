import { formatAddress, useWallets } from '@0xsequence/connect'
import { cardVariants, cn, Text } from '@0xsequence/design-system'
import { useObservable } from 'micro-observables'

import { GradientAvatarList } from '../../components/GradientAvatarList'
import { ListCardSelect } from '../../components/ListCard/ListCardSelect'
import { WalletAccountGradient } from '../../components/WalletAccountGradient'
import { useSettings } from '../../hooks'
import { getConnectorLogo } from '../../utils/wallets'

export const SettingsWallets = () => {
  const { wallets, disconnectWallet } = useWallets()
  const { selectedWalletsObservable } = useSettings()
  const selectedWallets = useObservable(selectedWalletsObservable)

  const DisconnectButton = ({ label, onClick }: { label: string; onClick: () => void }) => {
    return (
      <div
        className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center rounded-full h-9')}
        onClick={onClick}
      >
        <Text color="primary" fontWeight="bold" variant="normal">
          {label}
        </Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-5 px-4 pt-3 gap-2">
      {wallets.length > 1 && (
        <ListCardSelect
          key="all"
          isSelected={selectedWallets.length > 1}
          type="custom"
          disabled
          rightChildren={
            <DisconnectButton
              label="Disconnect All"
              onClick={() => wallets.forEach(wallet => disconnectWallet(wallet.address))}
            />
          }
        >
          <GradientAvatarList accountAddressList={wallets.map(wallet => wallet.address)} size="md" />
          <Text color="primary" fontWeight="medium" variant="normal">
            All
          </Text>
        </ListCardSelect>
      )}
      {wallets.map(wallet => (
        <ListCardSelect
          key={wallet.address}
          isSelected={selectedWallets.length === 1 && selectedWallets.find(w => w.address === wallet.address) !== undefined}
          type="custom"
          disabled
          rightChildren={<DisconnectButton label="Disconnect" onClick={() => disconnectWallet(wallet.address)} />}
        >
          <WalletAccountGradient
            accountAddress={wallet.address}
            loginIcon={getConnectorLogo(wallet.signInMethod)}
            size={'small'}
          />
          <Text color="primary" fontWeight="medium" variant="normal">
            {formatAddress(wallet.address)}
          </Text>
        </ListCardSelect>
      ))}
    </div>
  )
}
