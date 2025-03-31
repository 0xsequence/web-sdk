import { useOpenConnectModal, useWallets } from '@0xsequence/connect'
import { ChevronLeftIcon, IconButton, Text } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

import { HEADER_HEIGHT, HEADER_HEIGHT_WITH_LABEL } from '../../constants'
import { useNavigation } from '../../hooks'
import { SelectWalletRow } from '../SelectWalletRow'
import { SlideupDrawer } from '../SlideupDrawer'

import { AccountInformation } from './components/AccountInformation'

export const WalletHeader = ({ label }: { label?: string }) => {
  const { wallets, setActiveWallet } = useWallets()
  const { setOpenConnectModal } = useOpenConnectModal()
  const { goBack } = useNavigation()

  const [accountSelectorModalOpen, setAccountSelectorModalOpen] = useState<boolean>(false)

  const onClickSelector = () => {
    setAccountSelectorModalOpen(true)
  }

  const handleAddNewWallet = () => {
    setAccountSelectorModalOpen(false)
    setOpenConnectModal(true)
  }

  const onClickBack = () => {
    goBack()
  }

  return (
    <div
      className="flex flex-col justify-between items-center fixed bg-background-primary w-full p-4 z-20 "
      style={{
        height: label ? HEADER_HEIGHT_WITH_LABEL : HEADER_HEIGHT
      }}
    >
      <div className="flex flex-row justify-between items-center w-full">
        <IconButton onClick={onClickBack} icon={ChevronLeftIcon} size="xs" />
        <AccountInformation onClickAccount={onClickSelector} />
        <div style={{ width: '28px' }} />
      </div>
      {label && (
        <Text variant="normal" color="primary" fontWeight="bold">
          {label}
        </Text>
      )}
      <AnimatePresence>
        {accountSelectorModalOpen && (
          <SlideupDrawer
            onClose={() => setAccountSelectorModalOpen(false)}
            label="Select main wallet"
            buttonLabel="+ Add new wallet"
            handleButtonPress={handleAddNewWallet}
            dragHandleWidth={28}
          >
            <div className="flex flex-col gap-2">
              {wallets.map((wallet, index) => (
                <SelectWalletRow
                  key={index}
                  wallet={wallet}
                  onClose={() => setAccountSelectorModalOpen(false)}
                  setActiveWallet={setActiveWallet}
                />
              ))}
            </div>
          </SlideupDrawer>
        )}
      </AnimatePresence>
    </div>
  )
}
