import { formatAddress, ConnectedWallet } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'

import { useSettings, useFiatWalletsMap } from '../../hooks'
import { CopyButton } from '../CopyButton'
import { ListCardSelect } from '../ListCard/ListCardSelect'
import { WalletAccountGradient } from '../WalletAccountGradient'

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
      <WalletAccountGradient accountAddress={wallet.address} size={'small'} />
      <div className="flex flex-col">
        <Text className="flex flex-row gap-1 items-center" nowrap color="primary" fontWeight="medium" variant="normal">
          {formatAddress(wallet.address)}
          <CopyButton text={wallet.address} buttonVariant="icon" onClick={e => e.stopPropagation()} />
        </Text>
      </div>
    </ListCardSelect>
  )
}
