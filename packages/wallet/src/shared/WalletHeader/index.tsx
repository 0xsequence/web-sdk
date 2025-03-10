import { ChevronLeftIcon, IconButton, SearchIcon } from '@0xsequence/design-system'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { AnimatePresence, motion } from 'motion/react'
import React, { useState, useRef, useEffect } from 'react'

import { HEADER_HEIGHT } from '../../constants'
import { useNavigation, useOpenWalletModal } from '../../hooks'

import { AccountInformation } from './components/AccountInformation'
import { WalletDropdownContent } from './components/WalletDropdownContent'

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
    <motion.div>
      <PopoverPrimitive.Root open={openWalletDropdown}>
        <PopoverPrimitive.Anchor />
        <div
          className="flex bg-background-primary z-20 fixed flex-row items-center justify-between w-full px-4"
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
          <div style={{ width: '44px' }} />
        </div>

        <AnimatePresence>
          {openWalletDropdown && (
            <PopoverPrimitive.Content asChild side="bottom" align="start">
              <WalletDropdownContent setOpenWalletDropdown={setOpenWalletDropdown} />
            </PopoverPrimitive.Content>
          )}
        </AnimatePresence>
      </PopoverPrimitive.Root>
    </motion.div>
  )
}
