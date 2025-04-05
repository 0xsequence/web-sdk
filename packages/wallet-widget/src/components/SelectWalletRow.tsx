import { formatAddress, ConnectedWallet } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'

import { useSettings } from '../hooks'
import { useFiatWalletsMap } from '../hooks/useFiatWalletsMap'
import { getConnectorLogo } from '../utils/wallets'

import { ListCardSelect } from './ListCard'
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
  const { fiatCurrency } = useSettings()
  const { fiatWalletsMap } = useFiatWalletsMap()

  function onSelectWallet() {
    setActiveWallet(wallet.address)
    onClose()
  }

  const fiatValue = fiatWalletsMap.find(w => w.accountAddress === wallet.address)?.fiatValue

  return (
    <ListCardSelect
      rightChildren={
        <Text color="muted" fontWeight="medium" variant="normal">
          {fiatCurrency.sign}
          {fiatValue}
        </Text>
      }
      onClick={onSelectWallet}
      isSelected={wallet.isActive}
    >
      <WalletAccountGradient accountAddress={wallet.address} loginIcon={getConnectorLogo(wallet.signInMethod)} size={'small'} />
      <div className="flex flex-col">
        <Text color="primary" fontWeight="medium" variant="normal">
          {formatAddress(wallet.address)}
        </Text>
      </div>
    </ListCardSelect>
  )
}
