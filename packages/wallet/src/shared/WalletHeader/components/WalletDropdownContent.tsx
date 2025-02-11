import {
  Button,
  IconButton,
  CloseIcon,
  GradientAvatar,
  Text,
  QrCodeIcon,
  SettingsIcon,
  SignoutIcon,
  TransactionIcon,
} from '@0xsequence/design-system';
import { formatAddress, useTheme } from '@0xsequence/kit'
import React, { forwardRef } from 'react'
import { useDisconnect, useAccount } from 'wagmi'

import { useNavigation } from '../../../hooks'
import { useOpenWalletModal } from '../../../hooks/useOpenWalletModal'
import { CopyButton } from '../../CopyButton'

interface WalletDropdownContentProps {
  setOpenWalletDropdown: React.Dispatch<React.SetStateAction<boolean>>
}

export const WalletDropdownContent = forwardRef(({ setOpenWalletDropdown }: WalletDropdownContentProps, ref: any) => {
  const { setNavigation } = useNavigation()
  const { setOpenWalletModal } = useOpenWalletModal()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { theme } = useTheme()
  const onClickReceive = () => {
    setOpenWalletDropdown(false)
    setNavigation({
      location: 'receive'
    })
  }

  const onClickHistory = () => {
    setOpenWalletDropdown(false)
    setNavigation({
      location: 'history'
    })
  }

  const onClickSettings = () => {
    setOpenWalletDropdown(false)
    setNavigation({
      location: 'settings'
    })
  }

  const onClickSignout = () => {
    setOpenWalletModal(false)
    setOpenWalletDropdown(false)
    disconnect()
  }

  const getDropdownBackgroundColor = () => {
    switch (theme) {
      case 'dark':
        return 'rgba(38, 38, 38, 0.85)'
      case 'light':
        return 'rgba(217, 217, 217, 0.85)'
      default:
        return vars.colors.transparent
    }
  }

  return (
    (<div
      className="p-3 z-30 rounded-xl"
      ref={ref}
      style={{
        position: 'relative',
        pointerEvents: 'auto',
        width: 'calc(100vw - 30px)',
        maxWidth: '370px',
        backdropFilter: 'blur(12.5px)',
        top: '16px',
        left: '15px',
        background: getDropdownBackgroundColor()
      }}>
      <div className="flex flex-row justify-between items-start">
        <div
          className="flex flex-row justify-center items-center gap-3 ml-2 text-text100">
          <GradientAvatar style={{ width: '28px' }} size="md" address={address || ''} />
          <Text variant="large" fontWeight="bold" color="text100">
            {formatAddress(address || '')}
          </Text>
          <CopyButton className="text-text100" buttonVariant="icon" size="md" text={address || ''} style={{ marginLeft: '-16px' }} />
        </div>
        <IconButton className="bg-button-glass" onClick={() => setOpenWalletDropdown(false)} size="xs" icon={CloseIcon} />
      </div>
      <div className="flex gap-2 mt-3 flex-col">
        <Button
          className="w-full"
          variant="glass"
          style={{ borderRadius: vars.radii.md }}
          leftIcon={QrCodeIcon}
          label="Receive"
          onClick={onClickReceive}
        />
        <Button
          className="w-full"
          style={{ borderRadius: vars.radii.md }}
          leftIcon={TransactionIcon}
          label="History"
          onClick={onClickHistory}
        />
        <Button
          className="w-full"
          style={{ borderRadius: vars.radii.md }}
          leftIcon={SettingsIcon}
          label="Settings"
          onClick={onClickSettings}
        />
        <Button
          className="w-full"
          label="Sign Out"
          style={{ borderRadius: vars.radii.md }}
          leftIcon={SignoutIcon}
          onClick={onClickSignout}
        />
      </div>
    </div>)
  );
})
