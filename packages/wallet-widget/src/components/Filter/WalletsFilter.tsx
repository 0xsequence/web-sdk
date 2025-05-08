import { formatAddress, useWallets } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'

import { useSettings } from '../../hooks/index.js'
import { useFiatWalletsMap } from '../../hooks/useFiatWalletsMap.js'
import { CopyButton } from '../CopyButton.js'
import { MediaIconWrapper } from '../IconWrappers/index.js'
import { ListCardSelect } from '../ListCard/ListCardSelect.js'
import { WalletAccountGradient } from '../WalletAccountGradient.js'

export const WalletsFilter = () => {
  const { selectedWalletsObservable, setSelectedWallets, fiatCurrency } = useSettings()
  const { fiatWalletsMap } = useFiatWalletsMap()
  const { wallets } = useWallets()

  const totalFiatValue = fiatWalletsMap.reduce((acc, wallet) => acc + Number(wallet.fiatValue), 0).toFixed(2)

  return (
    <div className="flex flex-col bg-background-primary gap-3">
      {wallets.length > 1 && (
        <ListCardSelect
          key="all"
          isSelected={selectedWalletsObservable.get().length > 1}
          rightChildren={
            <Text color="muted" fontWeight="medium" variant="normal">
              {fiatCurrency.sign}
              {totalFiatValue}
            </Text>
          }
          onClick={() => setSelectedWallets([])}
        >
          <MediaIconWrapper iconList={wallets.map(wallet => wallet.address)} size="sm" isAccount />
          <Text color="primary" fontWeight="medium" variant="normal">
            All
          </Text>
        </ListCardSelect>
      )}
      {wallets.map(wallet => (
        <ListCardSelect
          key={wallet.address}
          isSelected={
            selectedWalletsObservable.get().length === 1 &&
            selectedWalletsObservable.get().find(w => w.address === wallet.address) !== undefined
          }
          rightChildren={
            <Text color="muted" fontWeight="medium" variant="normal">
              {fiatCurrency.sign}
              {fiatWalletsMap.find(w => w.accountAddress === wallet.address)?.fiatValue}
            </Text>
          }
          onClick={() => setSelectedWallets([wallet])}
        >
          <WalletAccountGradient accountAddress={wallet.address} size={'small'} />
          <Text className="flex flex-row gap-1 items-center" nowrap color="primary" fontWeight="medium" variant="normal">
            {formatAddress(wallet.address)}
            <CopyButton text={wallet.address} buttonVariant="icon" onClick={e => e.stopPropagation()} />
          </Text>
        </ListCardSelect>
      ))}
    </div>
  )
}
