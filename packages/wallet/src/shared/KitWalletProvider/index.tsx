import { ethers } from 'ethers'
import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Box, Modal, ThemeProvider, Scroll } from '@0xsequence/design-system'
import { getModalPositionCss, useTheme } from '@0xsequence/kit'
import { AnimatePresence } from 'framer-motion'

import { getHeader, getContent } from './utils'

import { History, Navigation, NavigationContextProvider, WalletModalContextProvider } from '../../contexts'

import { HEADER_HEIGHT } from '../../constants'
import * as styles from '../styles.css'

import '@0xsequence/design-system/styles.css'

export type KitWalletProviderProps = {
  children: React.ReactNode
}

const DEFAULT_LOCATION: Navigation = {
  location: 'home'
}

// const DEFAULT_LOCATION: Navigation = {
//   location: 'search',
// }

// const DEFAULT_LOCATION: Navigation = {
//   location: 'collection-details',
//   params: {
//     contractAddress: '0x631998e91476da5b870d741192fc5cbc55f5a52e',
//     chainId: 137,
//   }
// }

// const DEFAULT_LOCATION: Navigation = {
//   location: 'coin-details',
//   params: {
//     contractAddress: ethers.constants.AddressZero,
//     chainId: 137,
//   }
// }

// const DEFAULT_LOCATION: Navigation = {
//   location: 'collectible-details',
//   params: {
//     contractAddress: '0x624e4fa6980afcf8ea27bfe08e2fb5979b64df1c',
//     chainId: 137,
//     tokenId: '14641',
//   }
// }

export const KitWalletProvider = (props: KitWalletProviderProps) => {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <KitWalletContent {...props} />
    </QueryClientProvider>
  )
}

export const KitWalletContent = ({ children }: KitWalletProviderProps) => {
  const { theme, position } = useTheme()

  // Wallet Modal Context
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)

  // Navigation Context
  const [history, setHistory] = useState<History>([])
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

  useEffect(() => {
    if (openWalletModal) {
      setHistory([])
    }
  }, [openWalletModal])

  return (
    <WalletModalContextProvider value={{ setOpenWalletModal, openWalletModalState: openWalletModal }}>
      <NavigationContextProvider value={{ setHistory, history }}>
        <div id="kit-wallet">
          <ThemeProvider root="#kit-wallet" scope="kit" theme={theme}>
            <AnimatePresence>
              {openWalletModal && (
                <Modal
                  contentProps={{
                    style: {
                      maxWidth: '400px',
                      height: 'fit-content',
                      ...getModalPositionCss(position)
                    }
                  }}
                  scroll={false}
                  backdropColor="backgroundBackdrop"
                  onClose={() => setOpenWalletModal(false)}
                >
                  <Box className={styles.walletContent} id="sequence-kit-wallet-content">
                    {getHeader(navigation)}

                    {displayScrollbar ? (
                      <Scroll className={styles.scrollbar} style={{ paddingTop: HEADER_HEIGHT, height: 'min(800px, 80vh)' }}>
                        {getContent(navigation)}
                      </Scroll>
                    ) : (
                      getContent(navigation)
                    )}
                  </Box>
                </Modal>
              )}
            </AnimatePresence>
          </ThemeProvider>
        </div>
        {children}
      </NavigationContextProvider>
    </WalletModalContextProvider>
  )
}
