import { formatAddress, useOpenConnectModal, useWallets } from '@0xsequence/connect'
import { cardVariants, cn, Text, Divider, IconButton, CheckmarkIcon, CloseIcon, Spinner } from '@0xsequence/design-system'
import { useState } from 'react'

import { MediaIconWrapper } from '../../components/IconWrappers'
import { ListCardSelect } from '../../components/ListCard/ListCardSelect'
import { WalletAccountGradient } from '../../components/WalletAccountGradient'
import { getConnectorLogo } from '../../utils/wallets'

export const SettingsWallets = () => {
  const { wallets, disconnectWallet } = useWallets()
  const { setOpenConnectModal } = useOpenConnectModal()

  const [disconnectConfirm, setDisconnectConfirm] = useState<string | null>(null)
  const [isUnlinking, setIsUnlinking] = useState<boolean>(false)

  const onClickAddWallet = () => {
    setOpenConnectModal(true)
  }

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

  const confrimDisconnectAll = () => {
    setDisconnectConfirm('All')
  }

  const confirmDisconnect = (address: string) => {
    setDisconnectConfirm(address)
  }

  const handleDisconnect = async () => {
    setIsUnlinking(true)
    if (disconnectConfirm === 'All') {
      wallets.forEach(async wallet => await disconnectWallet(wallet.address))
    } else {
      await disconnectWallet(disconnectConfirm || '')
    }
    setDisconnectConfirm(null)
    setIsUnlinking(false)
  }

  return (
    <div className="flex flex-col justify-between" style={{ height: '100%' }}>
      <div className="flex flex-col p-4 gap-2">
        {wallets.length > 1 && (
          <ListCardSelect
            key="all"
            type="custom"
            disabled
            rightChildren={
              isUnlinking ? (
                <Spinner />
              ) : disconnectConfirm === 'All' ? (
                <div className="flex gap-3">
                  <IconButton size="xs" variant="danger" icon={CheckmarkIcon} onClick={() => handleDisconnect()} />
                  <IconButton size="xs" variant="glass" icon={CloseIcon} onClick={() => setDisconnectConfirm(null)} />
                </div>
              ) : (
                <DisconnectButton label="Disconnect All" onClick={() => confrimDisconnectAll()} />
              )
            }
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
            type="custom"
            disabled
            rightChildren={
              isUnlinking && disconnectConfirm === wallet.address ? (
                <Spinner />
              ) : disconnectConfirm === wallet.address ? (
                <div className="flex gap-3">
                  <IconButton size="xs" variant="danger" icon={CheckmarkIcon} onClick={() => handleDisconnect()} />
                  <IconButton size="xs" variant="glass" icon={CloseIcon} onClick={() => setDisconnectConfirm(null)} />
                </div>
              ) : (
                <DisconnectButton label="Disconnect" onClick={() => confirmDisconnect(wallet.address)} />
              )
            }
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

      <div>
        <Divider className="my-0" />
        <div className="rounded-none m-4">
          <div
            className={cn(
              cardVariants({ clickable: true }),
              'flex justify-center items-center bg-gradient-primary rounded-full gap-2 p-3'
            )}
            onClick={() => onClickAddWallet()}
          >
            <Text color="primary" fontWeight="bold" variant="normal">
              Add Wallet
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}
