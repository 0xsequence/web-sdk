'use client'

import { SequenceCheckoutProvider, useAddFundsModal } from '@0xsequence/checkout'
import { getModalPositionCss, useTheme, ShadowRoot, useOpenConnectModal } from '@0xsequence/connect'
import { Modal, Scroll } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import React, { useState } from 'react'

import { HEADER_HEIGHT, HEADER_HEIGHT_WITH_LABEL } from '../../constants'
import { History, Navigation, NavigationContextProvider, WalletModalContextProvider, WalletOptions } from '../../contexts'

import { FiatWalletsMapProvider } from './ProviderComponents/FiatWalletsMapProvider'
import { getHeader, getContent } from './utils'

export const WALLET_WIDTH = 460

export type SequenceWalletProviderProps = {
  children: React.ReactNode
}

const DEFAULT_LOCATION: Navigation = {
  location: 'home'
}

export const SequenceWalletProvider = (props: SequenceWalletProviderProps) => {
  return (
    <SequenceCheckoutProvider>
      <WalletContent {...props} />
    </SequenceCheckoutProvider>
  )
}

export const WalletContent = ({ children }: SequenceWalletProviderProps) => {
  const { theme, position } = useTheme()
  const { isAddFundsModalOpen } = useAddFundsModal()
  const { isConnectModalOpen } = useOpenConnectModal()
  // Wallet Modal Context
  const [openWalletModal, setOpenWalletModalState] = useState<boolean>(false)

  const setOpenWalletModal = (open: boolean, options?: WalletOptions) => {
    setOpenWalletModalState(open)
    setTimeout(() => {
      setHistory(options?.defaultNavigation ? [options.defaultNavigation] : [])
    }, 0)
  }

  // Navigation Context
  const [history, setHistory] = useState<History>([])
  const [isBackButtonEnabled, setIsBackButtonEnabled] = useState(true)
  const navigation = history.length > 0 ? history[history.length - 1] : DEFAULT_LOCATION

  const displayScrollbar =
    navigation.location === 'home' ||
    navigation.location === 'send-general' ||
    navigation.location === 'swap' ||
    navigation.location === 'collectible-details' ||
    navigation.location === 'coin-details' ||
    navigation.location === 'history' ||
    navigation.location === 'search' ||
    navigation.location === 'search-view-all' ||
    navigation.location === 'settings' ||
    navigation.location === 'settings-wallets' ||
    navigation.location === 'settings-networks' ||
    navigation.location === 'settings-currency' ||
    navigation.location === 'settings-profiles' ||
    navigation.location === 'settings-preferences' ||
    navigation.location === 'settings-apps' ||
    navigation.location === 'legacy-settings-currency' ||
    navigation.location === 'search-tokens' ||
    navigation.location === 'search-collectibles'

  let paddingTop = 0
  switch (navigation.location) {
    case 'home':
      paddingTop = 0
      break
    case 'send-general':
      paddingTop = HEADER_HEIGHT_WITH_LABEL
      break
    case 'swap':
      paddingTop = HEADER_HEIGHT_WITH_LABEL
      break
    default:
      paddingTop = HEADER_HEIGHT
  }

  return (
    <WalletModalContextProvider value={{ setOpenWalletModal, openWalletModalState: openWalletModal }}>
      <NavigationContextProvider value={{ setHistory, history, isBackButtonEnabled, setIsBackButtonEnabled }}>
        <FiatWalletsMapProvider>
          <ShadowRoot theme={theme}>
            <AnimatePresence>
              {openWalletModal && !isAddFundsModalOpen && !isConnectModalOpen && (
                <Modal
                  contentProps={{
                    style: {
                      maxWidth: WALLET_WIDTH,
                      height: 'fit-content',
                      ...getModalPositionCss(position),
                      scrollbarColor: 'gray black',
                      scrollbarWidth: 'thin'
                    }
                  }}
                  scroll={false}
                  onClose={() => setOpenWalletModal(false)}
                >
                  <div id="sequence-kit-wallet-content">
                    {getHeader(navigation)}

                    {displayScrollbar ? (
                      <Scroll style={{ paddingTop: paddingTop, height: 'min(800px, 90vh)' }}>{getContent(navigation)}</Scroll>
                    ) : (
                      getContent(navigation)
                    )}
                  </div>
                </Modal>
              )}
            </AnimatePresence>
          </ShadowRoot>
          {children}
        </FiatWalletsMapProvider>
      </NavigationContextProvider>
    </WalletModalContextProvider>
  )
}
