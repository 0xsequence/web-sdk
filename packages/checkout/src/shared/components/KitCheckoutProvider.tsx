'use client'

import { Box, Modal, ThemeProvider } from '@0xsequence/design-system'
import { getModalPositionCss, useTheme } from '@0xsequence/kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
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
} from '../../contexts'
import { PAYMENT_SELECTION_MODAL_HEIGHT } from '../../constants'
import { NavigationHeader } from '../../shared/components/NavigationHeader'
import {
  PendingTransaction,
  TransactionError,
  TransactionSuccess,
  CheckoutSelection,
  AddFundsContent,
  PaymentSelection,
  TransferToWallet
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
  const [settings, setSettings] = useState<CheckoutSettings>()
  const [selectPaymentSettings, setSelectPaymentSettings] = useState<SelectPaymentSettings>()
  const [addFundsSettings, setAddFundsSettings] = useState<AddFundsSettings>()
  const [transferFundsSettings, setTransferFundsSettings] = useState<TransferFundsSettings>()
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

  const getCheckoutContent = () => {
    const { location } = navigation
    switch (location) {
      case 'select-method-checkout':
        return <CheckoutSelection />
      case 'transaction-pending':
        return <PendingTransaction />
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
              <div id="kit-checkout">
                <ThemeProvider root="#kit-checkout" scope="kit" theme={theme}>
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
                        backdropColor="backgroundBackdrop"
                        onClose={() => setOpenCheckoutModal(false)}
                      >
                        <Box id="sequence-kit-checkout-content">
                          {getCheckoutHeader()}
                          {getCheckoutContent()}
                        </Box>
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
                        backdropColor="backgroundBackdrop"
                        onClose={closeAddFunds}
                      >
                        <Box id="sequence-kit-add-funds-content">
                          {getAddFundsHeader()}
                          {getAddFundsContent()}
                        </Box>
                      </Modal>
                    )}
                    {openPaymentSelectionModal && (
                      <Modal
                        contentProps={{
                          style: {
                            maxHeight: PAYMENT_SELECTION_MODAL_HEIGHT,
                            maxWidth: '420px',
                            ...getModalPositionCss(position)
                          }
                        }}
                        backdropColor="backgroundBackdrop"
                        onClose={() => setOpenPaymentSelectionModal(false)}
                      >
                        <Box id="sequence-kit-payment-selection-content">
                          <PaymentSelection />
                        </Box>
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
                        backdropColor="backgroundBackdrop"
                        onClose={closeTransferFunds}
                      >
                        <Box id="sequence-kit-transfer-funds-modal">
                          <NavigationHeader primaryText="Receive" />
                          <TransferToWallet />
                        </Box>
                      </Modal>
                    )}
                  </AnimatePresence>
                </ThemeProvider>
              </div>
              {children}
            </NavigationContextProvider>
          </TransferFundsContextProvider>
        </CheckoutModalContextProvider>
      </AddFundsContextProvider>
    </SelectPaymentContextProvider>
  )
}
