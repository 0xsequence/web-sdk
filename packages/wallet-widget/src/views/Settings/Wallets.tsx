import { useOpenConnectModal, useWallets } from '@0xsequence/connect'
import { cardVariants, CheckmarkIcon, CloseIcon, cn, Divider, IconButton, Spinner, Text } from '@0xsequence/design-system'
import { useState } from 'react'

import { ListCard } from '../../components/ListCard/ListCard.js'
import { ListCardWallet } from '../../components/ListCard/ListCardWallet.js'
import { WalletAccountGradient } from '../../components/WalletAccountGradient.js'

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
        <Text color="primary" fontWeight="bold" variant="normal" nowrap>
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
    <div className="flex flex-col justify-between">
      <div className="flex flex-col px-4 pb-4 gap-2">
        {wallets.length > 1 && (
          <ListCard
            key="all"
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
            <WalletAccountGradient accountAddresses={wallets.map(wallet => wallet.address)} />
            <Text color="primary" fontWeight="medium" variant="normal">
              All
            </Text>
          </ListCard>
        )}
        {wallets.map(wallet => (
          <ListCardWallet
            key="all"
            disabled
            wallet={wallet}
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
          />
        ))}
      </div>

      <div className="bg-background-primary" style={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <Divider className="my-0" />
        <div className="rounded-none m-4">
          <div
            className={cn(
              cardVariants({ clickable: true }),
              'flex bg-background-secondary justify-center items-center rounded-full gap-2 p-3'
            )}
            onClick={() => onClickAddWallet()}
          >
            <Text color="primary" fontWeight="bold" variant="normal">
              + Add new Wallet
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}
