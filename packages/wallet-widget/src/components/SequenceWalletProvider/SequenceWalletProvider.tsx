'use client'

import { SequenceCheckoutProvider, useAddFundsModal } from '@0xsequence/checkout'
import {
  getModalPositionCss,
  ShadowRoot,
  useConnectConfigContext,
  useOpenConnectModal,
  useSocialLink,
  useTheme
} from '@0xsequence/connect'
import { Modal, Scroll, ToastProvider } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import { useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAccount } from 'wagmi'

import { WALLET_HEIGHT, WALLET_WIDTH } from '../../constants/index.js'
import {
  NavigationContextProvider,
  WalletModalContextProvider,
  type History,
  type Navigation,
  type WalletOptions
} from '../../contexts/index.js'
import { NavigationHeaderContextProvider } from '../../contexts/NavigationHeader.js'
import { WalletContentRefContext, WalletContentRefProvider } from '../../contexts/WalletContentRef.js'

import { SharedProvider } from './ProviderComponents/SharedProvider.js'
import { SwapProvider } from './ProviderComponents/SwapProvider.js'
import { ValueRegistryProvider } from './ProviderComponents/ValueRegistryProvider.js'
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
  const { isSocialLinkOpen } = useSocialLink()
  const { address } = useAccount()
  const { customCSS } = useConnectConfigContext()

  useEffect(() => {
    if (!address) {
      setOpenWalletModal(false)
    }
  }, [address])

  // Wallet Modal Context
  const [openWalletModal, setOpenWalletModalState] = useState<boolean>(false)

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    } else {
      const event = new CustomEvent('sequence:wallet-modal-state-change', {
        detail: { open: openWalletModal }
      })
      window.dispatchEvent(event)
    }
  }, [openWalletModal])

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

  // Navigation Header Context
  const [search, setSearch] = useState('')
  const [selectedTab, setSelectedTab] = useState<'tokens' | 'collectibles' | 'history'>('tokens')

  const displayScrollbar =
    navigation.location === 'home' ||
    navigation.location === 'send-general' ||
    navigation.location === 'send-coin' ||
    navigation.location === 'collectible-details' ||
    navigation.location === 'coin-details' ||
    navigation.location === 'collection-details' ||
    navigation.location === 'transaction-details' ||
    navigation.location === 'swap' ||
    navigation.location === 'search' ||
    navigation.location === 'settings-wallets' ||
    navigation.location === 'settings-currency' ||
    navigation.location === 'settings-profiles' ||
    navigation.location === 'settings-apps'

  const walletContentRef = useContext(WalletContentRefContext)

  return (
    <WalletModalContextProvider value={{ setOpenWalletModal, openWalletModalState: openWalletModal }}>
      <NavigationContextProvider value={{ setHistory, history, isBackButtonEnabled, setIsBackButtonEnabled }}>
        <SharedProvider>
          <ValueRegistryProvider>
            <NavigationHeaderContextProvider value={{ search, selectedTab, setSearch, setSelectedTab }}>
              <ToastProvider>
                <SwapProvider>
                  <ShadowRoot theme={theme} customCSS={customCSS}>
                    <AnimatePresence>
                      {openWalletModal && !isAddFundsModalOpen && !isConnectModalOpen && !isSocialLinkOpen && (
                        <Modal
                          contentProps={{
                            className: 'border border-border-normal',
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
                            style={{ height: `calc(${WALLET_HEIGHT} - 2px)` }}
                            // -2 px because of the Modal border
                          >
                            <div>{getHeader(navigation)}</div>

                            <div style={{ flex: 1, minHeight: 0 }}>
                              {displayScrollbar ? (
                                <Scroll shadows={false}>{getContent(navigation)}</Scroll>
                              ) : (
                                getContent(navigation)
                              )}
                            </div>
                          </div>
                        </Modal>
                      )}
                    </AnimatePresence>
                  </ShadowRoot>
                  {children}
                </SwapProvider>
              </ToastProvider>
            </NavigationHeaderContextProvider>
          </ValueRegistryProvider>
        </SharedProvider>
      </NavigationContextProvider>
    </WalletModalContextProvider>
  )
}
