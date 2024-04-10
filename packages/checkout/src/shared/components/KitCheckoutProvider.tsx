import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Box, Modal, ThemeProvider } from '@0xsequence/design-system'
import { AnimatePresence } from 'framer-motion'

import { getModalPositionCss, useTheme } from '@0xsequence/kit'

import { PaperTransactionForm, PendingTransaction, TransactionError, TransactionSuccess, CheckoutSelection } from '../../views'
import { History, Navigation, NavigationContextProvider, CheckoutModalContextProvider, CheckoutSettings } from '../../contexts'

import { NavigationHeader } from '../../shared/components/NavigationHeader'
import * as sharedStyles from '../../shared/styles.css'

import '@0xsequence/design-system/styles.css'

export type KitCheckoutProvider = {
  children: React.ReactNode
}

export const DEFAULT_LOCATION: Navigation = {
  location: 'select-method-checkout'
}

// export const DEFAULT_LOCATION: Navigation = {
//   location: 'transaction-form',
// }

// export const DEFAULT_LOCATION: Navigation = {
//   location: 'transaction-pending',
//   params: {
//     transactionId: '48a47f94-475b-41f2-8370-7b3d279ba662'
//   }
// }

// export const DEFAULT_LOCATION: Navigation = {
//   location: 'transaction-success',
//   params: {
//     transactionHash: '0x48a47f94-475b-41f2-8370-7b3d279ba662'
//   }
// }

// export const DEFAULT_LOCATION: Navigation = {
//   location: 'transaction-error',
//   params: {
//     error: new Error('an error occurred'),
//   }
// }

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
  const [settings, setSettings] = useState<CheckoutSettings>()
  const [history, setHistory] = useState<History>([])
  const navigation = history.length > 0 ? history[history.length - 1] : DEFAULT_LOCATION

  const triggerCheckout = (settings: CheckoutSettings) => {
    setSettings(settings)
    setOpenCheckoutModal(true)
  }

  const closeCheckout = () => {
    setOpenCheckoutModal(false)
  }

  const getContent = () => {
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
        return <PaperTransactionForm />
    }
  }

  const getHeader = () => {
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

  useEffect(() => {
    if (openCheckoutModal) {
      setHistory([])
    }
  }, [openCheckoutModal])

  return (
    <CheckoutModalContextProvider value={{ triggerCheckout, closeCheckout, settings, theme }}>
      <NavigationContextProvider value={{ history, setHistory }}>
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
                  <Box id="sequence-kit-checkout-content" className={sharedStyles.walletContent}>
                    {getHeader()}
                    {getContent()}
                  </Box>
                </Modal>
              )}
            </AnimatePresence>
          </ThemeProvider>
        </div>
        {children}
      </NavigationContextProvider>
    </CheckoutModalContextProvider>
  )
}
