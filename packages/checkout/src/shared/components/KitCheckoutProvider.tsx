'use client'

import { Modal } from '@0xsequence/design-system'
import { getModalPositionCss, ShadowRoot, useTheme } from '@0xsequence/kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence } from 'motion/react'
import React, { useState, useEffect } from 'react'

import {
  History,
  Navigation,
  NavigationContextProvider,
  CheckoutModalContextProvider,
  CheckoutSettings,
  AddFundsContextProvider,
  AddFundsSettings,
  SelectPaymentContextProvider,
  SelectPaymentSettings,
  TransferFundsContextProvider,
  TransferFundsSettings,
  TransactionStatusSettings,
  TransactionStatusModalContextProvider,
  SwapModalSettings,
  SwapModalContextProvider
} from '../../contexts'
import { NavigationHeader } from '../../shared/components/NavigationHeader'
import {
  PendingCreditCardTransaction,
  TransactionError,
  TransactionSuccess,
  CheckoutSelection,
  AddFundsContent,
  PaymentSelection,
  TransferToWallet,
  TransactionStatus,
  Swap
} from '../../views'

export type KitCheckoutProvider = {
  children: React.ReactNode
}

export const KitCheckoutProvider = (props: KitCheckoutProvider) => {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <KitCheckoutContent {...props} />
    </QueryClientProvider>
  )
}

export const KitCheckoutContent = ({ children }: KitCheckoutProvider) => {
  const { theme, position } = useTheme()
  const [openCheckoutModal, setOpenCheckoutModal] = useState<boolean>(false)
  const [openAddFundsModal, setOpenAddFundsModal] = useState<boolean>(false)
  const [openTransferFundsModal, setOpenTransferFundsModal] = useState<boolean>(false)
  const [openPaymentSelectionModal, setOpenPaymentSelectionModal] = useState<boolean>(false)
  const [openTransactionStatusModal, setOpenTransactionStatusModal] = useState<boolean>(false)
  const [isOpenSwapModal, setIsOpenSwapModal] = useState<boolean>(false)
  const [settings, setSettings] = useState<CheckoutSettings>()
  const [selectPaymentSettings, setSelectPaymentSettings] = useState<SelectPaymentSettings>()
  const [addFundsSettings, setAddFundsSettings] = useState<AddFundsSettings>()
  const [transferFundsSettings, setTransferFundsSettings] = useState<TransferFundsSettings>()
  const [transactionStatusSettings, setTransactionStatusSettings] = useState<TransactionStatusSettings>()
  const [swapModalSettings, setSwapModalSettings] = useState<SwapModalSettings>()
  const [history, setHistory] = useState<History>([])

  const getDefaultLocation = (): Navigation => {
    // skip the order summary for credit card checkout if no items provided
    const orderSummaryItems = settings?.orderSummaryItems || []
    const creditCardSettings = settings?.creditCardCheckout
    if (orderSummaryItems.length === 0 && creditCardSettings) {
      return {
        location: 'transaction-pending',
        params: {
          creditCardCheckout: creditCardSettings
        }
      }
    } else {
      return {
        location: 'select-method-checkout'
      }
    }
  }

  const navigation = history.length > 0 ? history[history.length - 1] : getDefaultLocation()

  const triggerCheckout = (settings: CheckoutSettings) => {
    setSettings(settings)
    setOpenCheckoutModal(true)
  }

  const closeCheckout = () => {
    setOpenCheckoutModal(false)
  }

  const triggerAddFunds = (settings: AddFundsSettings) => {
    setAddFundsSettings(settings)
    setOpenAddFundsModal(true)
  }

  const closeAddFunds = () => {
    setOpenAddFundsModal(false)
    if (addFundsSettings?.onClose) {
      addFundsSettings.onClose()
    }
  }

  const openTransferFunds = (settings: TransferFundsSettings) => {
    setTransferFundsSettings(settings)
    setOpenTransferFundsModal(true)
  }

  const closeTransferFunds = () => {
    if (openTransferFundsModal) {
      setOpenTransferFundsModal(false)
      if (transferFundsSettings?.onClose) {
        transferFundsSettings.onClose()
      }
    }
  }

  const openSelectPaymentModal = (settings: SelectPaymentSettings) => {
    setSelectPaymentSettings(settings)
    setOpenPaymentSelectionModal(true)
  }

  const closeSelectPaymentModal = () => {
    setOpenPaymentSelectionModal(false)
  }

  const triggerTransactionStatusModal = (settings: TransactionStatusSettings) => {
    setTransactionStatusSettings(settings)
    setOpenTransactionStatusModal(true)
  }

  const closeTransactionStatusModal = () => {
    setOpenTransactionStatusModal(false)
  }
  const openSwapModal = (settings: SwapModalSettings) => {
    setSwapModalSettings(settings)
    setIsOpenSwapModal(true)
  }

  const closeSwapModal = () => {
    setIsOpenSwapModal(false)
  }

  const getCheckoutContent = () => {
    const { location } = navigation
    switch (location) {
      case 'select-method-checkout':
        return <CheckoutSelection />
      case 'transaction-pending':
        return <PendingCreditCardTransaction />
      case 'transaction-success':
        return <TransactionSuccess />
      case 'transaction-error':
        return <TransactionError />
      case 'transaction-form':
      default:
        return <CheckoutSelection />
    }
  }

  const getCheckoutHeader = () => {
    const { location } = navigation
    switch (location) {
      case 'select-method-checkout':
        return <NavigationHeader primaryText="Checkout" />
      case 'transaction-success':
      case 'transaction-error':
      case 'transaction-pending':
        return <NavigationHeader disableBack primaryText="Pay with credit or debit card" />
      case 'transaction-form':
      default:
        return <NavigationHeader primaryText="Pay with credit or debit card" />
    }
  }

  const getAddFundsHeader = () => {
    const { location } = navigation
    switch (location) {
      default:
        return <NavigationHeader primaryText="Add funds with credit card or debit card" />
    }
  }

  const getAddFundsContent = () => {
    const { location } = navigation
    switch (location) {
      default:
        return <AddFundsContent />
    }
  }

  useEffect(() => {
    if (openCheckoutModal || openAddFundsModal || openPaymentSelectionModal) {
      setHistory([])
    }
  }, [openCheckoutModal, openAddFundsModal, openPaymentSelectionModal])

  return (
    <SwapModalContextProvider
      value={{
        openSwapModal,
        closeSwapModal,
        swapModalSettings
      }}
    >
      <TransactionStatusModalContextProvider
        value={{
          openTransactionStatusModal: triggerTransactionStatusModal,
          closeTransactionStatusModal,
          transactionStatusSettings
        }}
      >
        <SelectPaymentContextProvider
          value={{
            openSelectPaymentModal,
            closeSelectPaymentModal,
            selectPaymentSettings
          }}
        >
          <AddFundsContextProvider
            value={{
              triggerAddFunds,
              closeAddFunds,
              addFundsSettings
            }}
          >
            <CheckoutModalContextProvider
              value={{
                triggerCheckout,
                closeCheckout,
                settings,
                theme
              }}
            >
              <TransferFundsContextProvider
                value={{
                  openTransferFundsModal: openTransferFunds,
                  closeTransferFundsModal: closeTransferFunds,
                  transferFundsSettings
                }}
              >
                <NavigationContextProvider value={{ history, setHistory, defaultLocation: getDefaultLocation() }}>
                  <ShadowRoot theme={theme}>
                    <AnimatePresence>
                      {openCheckoutModal && (
                        <Modal
                          contentProps={{
                            style: {
                              maxWidth: '400px',
                              height: 'auto',
                              ...getModalPositionCss(position)
                            }
                          }}
                          scroll={false}
                          onClose={() => setOpenCheckoutModal(false)}
                        >
                          <div id="sequence-kit-checkout-content">
                            {getCheckoutHeader()}
                            {getCheckoutContent()}
                          </div>
                        </Modal>
                      )}
                      {openAddFundsModal && (
                        <Modal
                          contentProps={{
                            style: {
                              maxWidth: '400px',
                              height: 'auto',
                              ...getModalPositionCss(position)
                            }
                          }}
                          scroll={false}
                          onClose={closeAddFunds}
                        >
                          <div id="sequence-kit-add-funds-content">
                            {getAddFundsHeader()}
                            {getAddFundsContent()}
                          </div>
                        </Modal>
                      )}
                      {openPaymentSelectionModal && (
                        <Modal
                          contentProps={{
                            style: {
                              maxWidth: '420px',
                              ...getModalPositionCss(position),
                              scrollbarColor: 'gray black',
                              scrollbarWidth: 'thin'
                            }
                          }}
                          onClose={() => setOpenPaymentSelectionModal(false)}
                        >
                          <div id="sequence-kit-payment-selection-content">
                            <PaymentSelection />
                          </div>
                        </Modal>
                      )}
                      {openTransferFundsModal && (
                        <Modal
                          contentProps={{
                            style: {
                              height: 'auto',
                              ...getModalPositionCss(position)
                            }
                          }}
                          onClose={closeTransferFunds}
                        >
                          <div id="sequence-kit-transfer-funds-modal">
                            <NavigationHeader primaryText="Receive" />
                            <TransferToWallet />
                          </div>
                        </Modal>
                      )}
                      {openTransactionStatusModal && (
                        <Modal
                          contentProps={{
                            style: {
                              height: 'auto',
                              ...getModalPositionCss(position)
                            }
                          }}
                          onClose={closeTransactionStatusModal}
                        >
                          <div id="sequence-kit-transaction-status-modal">
                            <TransactionStatus />
                          </div>
                        </Modal>
                      )}
                      {isOpenSwapModal && (
                        <Modal
                          contentProps={{
                            style: {
                              maxWidth: '450px',
                              height: 'auto',
                              ...getModalPositionCss(position)
                            }
                          }}
                          onClose={closeSwapModal}
                        >
                          <div id="sequence-kit-swap-modal">
                            <NavigationHeader primaryText={swapModalSettings?.title || 'Swap'} />
                            <Swap />
                          </div>
                        </Modal>
                      )}
                    </AnimatePresence>
                  </ShadowRoot>
                  {children}
                </NavigationContextProvider>
              </TransferFundsContextProvider>
            </CheckoutModalContextProvider>
          </AddFundsContextProvider>
        </SelectPaymentContextProvider>
      </TransactionStatusModalContextProvider>
    </SwapModalContextProvider>
  )
}
