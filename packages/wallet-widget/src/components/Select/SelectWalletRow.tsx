import { formatAddress, type ConnectedWallet } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'

import { useFiatWalletsMap, useSettings } from '../../hooks/index.js'
import { CopyButton } from '../CopyButton.js'
import { ListCardSelect } from '../ListCard/ListCardSelect.js'
import { WalletAccountGradient } from '../WalletAccountGradient.js'

export const SelectWalletRow = ({
  wallet,
  isSelected = false,
  onClick,
  onClose
}: {
  wallet: ConnectedWallet
  isSelected?: boolean
  onClick: (address: string) => void
  onClose: () => void
}) => {
  const { fiatCurrency } = useSettings()
  const { fiatWalletsMap } = useFiatWalletsMap()

  function onSelectWallet() {
    onClick(wallet.address)
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
      isSelected={wallet.isActive || isSelected}
    >
      <WalletAccountGradient accountAddresses={[wallet.address]} />
      <div className="flex flex-col">
        <Text className="flex flex-row gap-1 items-center" nowrap color="primary" fontWeight="medium" variant="normal">
          <div className="flex flex-col">{formatAddress(wallet.address)}</div>
          <CopyButton text={wallet.address} onClick={e => e.stopPropagation()} />
        </Text>
      </div>
    </ListCardSelect>
  )
}
