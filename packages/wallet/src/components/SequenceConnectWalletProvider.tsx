import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Modal,
  ThemeProvider,
} from '@0xsequence/design-system'
import { AnimatePresence } from 'framer-motion'

import { AllCoins, Home } from '../views'
import { Navigation, NavigationContext, WalletModalContext } from '../contexts'

import '@0xsequence/design-system/styles.css'

export declare const THEME: readonly ["dark", "light"];
export declare type Theme = typeof THEME[number];
export const THEMES = {
  dark: 'dark' as Theme,
  light: 'light' as Theme
};

export type SequenceConnectWalletProvider = {
  children: React.ReactNode,
  theme?: Theme
}

export const SequenceConnectWalletProvider = ({ children, theme }: SequenceConnectWalletProvider) => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [navigation, setNavigation] = useState<Navigation>({
    location: 'home'
  })

  const queryClient = new QueryClient()

  const getContent = () => {
    const { location } = navigation
    switch (location) {
      case 'all-coins':
        return <AllCoins />
      case 'home':
      default:
        return <Home />
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WalletModalContext.Provider value={{ setOpenWalletModal }}>
        <NavigationContext.Provider value={{ setNavigation }}>
          <ThemeProvider theme={theme}>
            <AnimatePresence>
              {openWalletModal && (
                <Modal scroll={false} backdropColor="transparent" size="sm" onClose={() => setOpenWalletModal(false)}>
                  {getContent()}
                </Modal>
              )}
            </AnimatePresence>
          </ThemeProvider>
          {children}
        </NavigationContext.Provider>
      </WalletModalContext.Provider>
    </QueryClientProvider>
  )
}
