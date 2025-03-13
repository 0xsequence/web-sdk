'use client'

import { Modal, Scroll } from '@0xsequence/design-system'
import { getModalPositionCss, useTheme, ShadowRoot } from '@0xsequence/react-connect'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence } from 'motion/react'
import React, { useState } from 'react'

import { HEADER_HEIGHT } from '../../constants'
import { History, Navigation, NavigationContextProvider, WalletModalContextProvider, WalletOptions } from '../../contexts'

import { getHeader, getContent } from './utils'

export type SequenceWalletProviderProps = {
  children: React.ReactNode
}

const DEFAULT_LOCATION: Navigation = {
  location: 'home'
}

export const SequenceWalletProvider = (props: SequenceWalletProviderProps) => {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <WalletContent {...props} />
    </QueryClientProvider>
  )
}

export const WalletContent = ({ children }: SequenceWalletProviderProps) => {
  const { theme, position } = useTheme()

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
    navigation.location === 'collection-details' ||
    navigation.location === 'collectible-details' ||
    navigation.location === 'coin-details' ||
    navigation.location === 'history' ||
    navigation.location === 'search' ||
    navigation.location === 'search-view-all' ||
    navigation.location === 'settings-currency'

  return (
    <WalletModalContextProvider value={{ setOpenWalletModal, openWalletModalState: openWalletModal }}>
      <NavigationContextProvider value={{ setHistory, history, isBackButtonEnabled, setIsBackButtonEnabled }}>
        <ShadowRoot theme={theme}>
          <AnimatePresence>
            {openWalletModal && (
              <Modal
                contentProps={{
                  style: {
                    maxWidth: '400px',
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
                    <Scroll style={{ paddingTop: HEADER_HEIGHT, height: 'min(800px, 80vh)' }}>{getContent(navigation)}</Scroll>
                  ) : (
                    getContent(navigation)
                  )}
                </div>
              </Modal>
            )}
          </AnimatePresence>
        </ShadowRoot>
        {children}
      </NavigationContextProvider>
    </WalletModalContextProvider>
  )
}
