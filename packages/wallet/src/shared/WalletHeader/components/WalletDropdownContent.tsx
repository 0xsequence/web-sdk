import {
  Box,
  Button,
  IconButton,
  CloseIcon,
  GradientAvatar,
  Text,
  QrCodeIcon,
  SettingsIcon,
  SignoutIcon,
  TransactionIcon,
  vars
} from '@0xsequence/design-system'
import { useTheme } from '@0xsequence/kit'
import React, { forwardRef } from 'react'
import { useDisconnect, useAccount } from 'wagmi'

import { useNavigation } from '../../../hooks'
import { useOpenWalletModal } from '../../../hooks/useOpenWalletModal'
import { formatAddress } from '../../../utils'
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
    <Box
      padding="3"
      ref={ref}
      zIndex="30"
      borderRadius="md"
      style={{
        position: 'relative',
        pointerEvents: 'auto',
        width: '370px',
        backdropFilter: 'blur(12.5px)',
        top: '16px',
        left: '15px',
        background: getDropdownBackgroundColor()
      }}
    >
      <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Box flexDirection="row" justifyContent="center" alignItems="center" gap="3" marginLeft="2" color="text100">
          <GradientAvatar style={{ width: '28px' }} size="md" address={address || ''} />
          <Text variant="large" fontWeight="bold" color="text100">
            {formatAddress(address || '')}
          </Text>
          <CopyButton buttonVariant="icon" size="md" text={address || ''} color="text100" style={{ marginLeft: '-16px' }} />
        </Box>
        <IconButton onClick={() => setOpenWalletDropdown(false)} size="xs" background="buttonGlass" icon={CloseIcon} />
      </Box>
      <Box gap="2" marginTop="3" flexDirection="column">
        <Button
          variant="glass"
          style={{ borderRadius: vars.radii.md }}
          width="full"
          leftIcon={QrCodeIcon}
          label="Receive"
          onClick={onClickReceive}
        />
        <Button
          style={{ borderRadius: vars.radii.md }}
          width="full"
          leftIcon={TransactionIcon}
          label="History"
          onClick={onClickHistory}
        />
        <Button
          style={{ borderRadius: vars.radii.md }}
          width="full"
          leftIcon={SettingsIcon}
          label="Settings"
          onClick={onClickSettings}
        />
        <Button
          label="Sign Out"
          style={{ borderRadius: vars.radii.md }}
          width="full"
          leftIcon={SignoutIcon}
          onClick={onClickSignout}
        />
      </Box>
    </Box>
  )
})
