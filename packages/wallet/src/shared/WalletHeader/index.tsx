import React, { useState, useRef, useEffect } from 'react'
import { Box, ChevronLeftIcon, IconButton, SearchIcon, vars } from '@0xsequence/design-system'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { AnimatePresence, motion } from 'framer-motion'

import { AccountInformation } from './components/AccountInformation'
import { WalletDropdownContent } from './components/WalletDropdownContent'

import { HEADER_HEIGHT } from '../../constants'
import { useNavigation, useOpenWalletModal } from '../../hooks'

import * as styles from './styles.css'

export const WalletHeader = () => {
  const { openWalletModalState } = useOpenWalletModal()

  const [openWalletDropdown, setOpenWalletDropdown] = useState<boolean>(false)
  const { goBack, history, setNavigation } = useNavigation()
  const hasDropdownOpened = useRef<boolean>(false)

  useEffect(() => {
    if (!openWalletModalState) {
      setOpenWalletDropdown(false)
    }
  }, [openWalletModalState])

  // Close dropdown when navigating to a new page
  useEffect(() => {
    if (openWalletDropdown) {
      if (!hasDropdownOpened.current) {
        hasDropdownOpened.current = true
      } else {
        setOpenWalletDropdown(false)
      }
    } else {
      hasDropdownOpened.current = false
    }
  }, [history.length, openWalletDropdown])

  const onClickAccount = () => {
    setOpenWalletDropdown(true)
  }

  const onClickBack = () => {
    goBack()
  }

  const onClickSearch = () => {
    setNavigation({
      location: 'search'
    })
  }

  return (
    <Box as={motion.div}>
      <PopoverPrimitive.Root open={openWalletDropdown}>
        <PopoverPrimitive.Anchor />
        <Box
          background="backgroundPrimary"
          zIndex="20"
          position="fixed"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          width="full"
          paddingX="4"
          style={{
            height: HEADER_HEIGHT,
            paddingTop: '6px'
          }}
        >
          {history.length > 0 ? (
            <IconButton onClick={onClickBack} icon={ChevronLeftIcon} size="xs" />
          ) : (
            <IconButton onClick={onClickSearch} icon={SearchIcon} size="xs" />
          )}
          <PopoverPrimitive.Trigger asChild>
            <AccountInformation onClickAccount={onClickAccount} />
          </PopoverPrimitive.Trigger>
          <Box style={{ width: '44px' }} />
        </Box>

        <AnimatePresence>
          {openWalletDropdown && (
            <PopoverPrimitive.Content asChild side="bottom" align="start">
              <WalletDropdownContent setOpenWalletDropdown={setOpenWalletDropdown} />
            </PopoverPrimitive.Content>
          )}
        </AnimatePresence>
      </PopoverPrimitive.Root>
    </Box>
  )
}
