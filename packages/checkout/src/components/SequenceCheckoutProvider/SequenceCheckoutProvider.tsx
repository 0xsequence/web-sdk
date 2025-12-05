'use client'

import { getModalPositionCss, ShadowRoot, useConnectConfigContext, useTheme } from '@0xsequence/connect'
import { Modal } from '@0xsequence/design-system'
import { AnimatePresence } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'

import {
  CheckoutModalContextProvider,
  EnvironmentContextProvider,
  NavigationCheckoutContextProvider,
  NavigationContextProvider,
  TransactionStatusModalContextProvider,
  TransferFundsContextProvider,
  type CheckoutSettings,
  type EnvironmentOverrides,
  type History,
  type HistoryCheckout,
  type Navigation,
  type NavigationCheckout,
  type TransactionStatusSettings,
  type TransferFundsSettings
} from '../../contexts/index.js'
import { PendingCreditCardTransaction, TransactionError, TransactionStatus, TransactionSuccess, TransferToWallet } from '../../views/index.js'
import { NavigationHeader } from '../NavigationHeader.js'

import { ForteController } from './ForteController.js'

export interface SequenceCheckoutConfig {
  env?: Partial<EnvironmentOverrides>
}

export type SequenceCheckoutProviderProps = {
  children: ReactNode
  config?: SequenceCheckoutConfig
}

const getDefaultLocationCheckout = (): NavigationCheckout => {
  return {
    location: 'payment-method-selection',
    params: {
      isInitialBalanceChecked: false
    }
  }
}
export const SequenceCheckoutProvider = ({ children, config }: SequenceCheckoutProviderProps) => {
  const { theme, position } = useTheme()
  const [openCheckoutModal, setOpenCheckoutModal] = useState<boolean>(false)
  const [openTransferFundsModal, setOpenTransferFundsModal] = useState<boolean>(false)
  const [openTransactionStatusModal, setOpenTransactionStatusModal] = useState<boolean>(false)
  const [settings, setSettings] = useState<CheckoutSettings>()
  const [transferFundsSettings, setTransferFundsSettings] = useState<TransferFundsSettings>()
  const [transactionStatusSettings, setTransactionStatusSettings] = useState<TransactionStatusSettings>()
  const [history, setHistory] = useState<History>([])
  const [checkoutHistory, setCheckoutHistory] = useState<HistoryCheckout>([getDefaultLocationCheckout()])
  const { customCSS } = useConnectConfigContext()

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

  // TODO: remove this navigation logic and all associated code, including components, once flows are migrated to updated checkout ui
  const navigation = history.length > 0 ? history[history.length - 1] : getDefaultLocation()

  const triggerCheckout = (settings: CheckoutSettings) => {
    setSettings(settings)
    setOpenCheckoutModal(true)
  }

  const closeCheckout = () => {
    setOpenCheckoutModal(false)
  }

  const triggerTransactionStatusModal = (settings: TransactionStatusSettings) => {
    setTransactionStatusSettings(settings)
    setOpenTransactionStatusModal(true)
  }

  const closeTransactionStatusModal = () => {
    setOpenTransactionStatusModal(false)
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

  const getCheckoutContent = () => {
    const { location } = navigation
    switch (location) {
      case 'transaction-success':
        return <TransactionSuccess />
      case 'transaction-error':
        return <TransactionError />
      case 'transaction-pending':
      default:
        return <PendingCreditCardTransaction />
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

  useEffect(() => {
    if (openCheckoutModal) {
      setHistory([])
    }
  }, [openCheckoutModal])

  return (
    <EnvironmentContextProvider
      value={{
        marketplaceApiUrl: config?.env?.marketplaceApiUrl ?? 'https://marketplace-api.sequence.app',
        forteWidgetUrl: config?.env?.forteWidgetUrl ?? 'https://payments.prod.lemmax.com/forte-payments-widget.js'
      }}
    >
      <ForteController>
        <TransactionStatusModalContextProvider
          value={{
            openTransactionStatusModal: triggerTransactionStatusModal,
            closeTransactionStatusModal,
            transactionStatusSettings
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
              <NavigationCheckoutContextProvider
                value={{
                  history: checkoutHistory,
                  setHistory: setCheckoutHistory,
                  defaultLocation: getDefaultLocationCheckout()
                }}
              >
                <ShadowRoot theme={theme} customCSS={customCSS}>
                  <AnimatePresence>
                    {openCheckoutModal && (
                      <Modal
                        contentProps={{
                          style: {
                            maxWidth: '540px',
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
                  </AnimatePresence>
                </ShadowRoot>
                {children}
              </NavigationCheckoutContextProvider>
            </NavigationContextProvider>
            </TransferFundsContextProvider>
          </CheckoutModalContextProvider>
        </TransactionStatusModalContextProvider>
      </ForteController>
    </EnvironmentContextProvider>
  )
}
