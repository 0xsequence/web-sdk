'use client'

import { SequenceCheckoutProvider, useAddFundsModal } from '@0xsequence/checkout'
import { getModalPositionCss, ShadowRoot, useConnectConfigContext, useOpenConnectModal, useTheme } from '@0xsequence/connect'
import { Modal, Scroll, ToastProvider } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import { useContext, useEffect, useState, type ReactNode } from 'react'
import { useAccount } from 'wagmi'

import { WALLET_HEIGHT, WALLET_WIDTH } from '../../constants/index.js'
import {
  NavigationContextProvider,
  WalletModalContextProvider,
  type History,
  type Navigation,
  type WalletOptions
} from '../../contexts/index.js'
import { WalletContentRefContext, WalletContentRefProvider } from '../../contexts/WalletContentRef.js'

import { FiatWalletsMapProvider } from './ProviderComponents/FiatWalletsMapProvider.js'
import { SwapProvider } from './ProviderComponents/SwapProvider.js'
import { getContent, getHeader } from './utils/index.js'

export type SequenceWalletProviderProps = {
  children: ReactNode
}

const DEFAULT_LOCATION: Navigation = {
  location: 'home'
}

export const SequenceWalletProvider = (props: SequenceWalletProviderProps) => {
  return (
    <SequenceCheckoutProvider>
      <WalletContentRefProvider>
        <WalletContent {...props} />
      </WalletContentRefProvider>
    </SequenceCheckoutProvider>
  )
}

export const WalletContent = ({ children }: SequenceWalletProviderProps) => {
  const { theme, position } = useTheme()
  const { isAddFundsModalOpen } = useAddFundsModal()
  const { isConnectModalOpen } = useOpenConnectModal()
  const { address } = useAccount()
  const { customCSS } = useConnectConfigContext()

  useEffect(() => {
    if (!address) {
      setOpenWalletModal(false)
    }
  }, [address])

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
    navigation.location === 'collectible-details' ||
    navigation.location === 'coin-details' ||
    navigation.location === 'history' ||
    navigation.location === 'search' ||
    navigation.location === 'settings-wallets' ||
    navigation.location === 'settings-networks' ||
    navigation.location === 'settings-currency' ||
    navigation.location === 'settings-profiles' ||
    navigation.location === 'settings-apps' ||
    navigation.location === 'legacy-settings-currency'

  const walletContentRef = useContext(WalletContentRefContext)

  return (
    <WalletModalContextProvider value={{ setOpenWalletModal, openWalletModalState: openWalletModal }}>
      <NavigationContextProvider value={{ setHistory, history, isBackButtonEnabled, setIsBackButtonEnabled }}>
        <FiatWalletsMapProvider>
          <ToastProvider>
            <SwapProvider>
              <ShadowRoot theme={theme} customCSS={customCSS}>
                <AnimatePresence>
                  {openWalletModal && !isAddFundsModalOpen && !isConnectModalOpen && (
                    <Modal
                      contentProps={{
                        className: 'border border-border-normal',
                        // className: 'border-2 border-violet-600',
                        style: {
                          maxWidth: WALLET_WIDTH,
                          height: WALLET_HEIGHT,
                          ...getModalPositionCss(position),
                          scrollbarColor: 'gray black',
                          scrollbarWidth: 'thin'
                        }
                      }}
                      scroll={false}
                      onClose={() => setOpenWalletModal(false)}
                    >
                      <div
                        className="flex flex-col"
                        id="sequence-kit-wallet-content"
                        ref={walletContentRef}
                        style={{ height: WALLET_HEIGHT }}
                      >
                        <div>{getHeader(navigation)}</div>

                        <div style={{ flex: 1, minHeight: 0 }}>
                          {displayScrollbar ? <Scroll>{getContent(navigation)}</Scroll> : getContent(navigation)}
                        </div>
                      </div>
                    </Modal>
                  )}
                </AnimatePresence>
              </ShadowRoot>
              {children}
            </SwapProvider>
          </ToastProvider>
        </FiatWalletsMapProvider>
      </NavigationContextProvider>
    </WalletModalContextProvider>
  )
}
