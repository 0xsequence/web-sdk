import { Box, Divider, Tabs, TabsContent, TabsHeader, TabsRoot, Text, WalletIcon, PaymentsIcon } from '@0xsequence/design-system'
import { compareAddress } from '@0xsequence/kit'
import { useState } from 'react'
import { zeroAddress } from 'viem'

import { HEADER_HEIGHT, PAYMENT_SELECTION_MODAL_HEIGHT } from '../../constants'
import { useSelectPaymentModal } from '../../hooks'
import { NavigationHeader } from '../../shared/components/NavigationHeader'

import { Footer } from './Footer'
import { OrderSummary } from './OrderSummary'
import { PayWithCreditCard } from './PayWithCreditCard'
import { PayWithCrypto } from './PayWithCrypto/index'
import { TransferFunds } from './TransferFunds'

export const PaymentSelection = () => {
  return (
    <>
      <PaymentSelectionHeader />
      <PaymentSelectionContent />
    </>
  )
}

export const PaymentSelectionHeader = () => {
  return <NavigationHeader primaryText="Checkout" />
}

type Tabs = 'crypto' | 'credit_card'

export const PaymentSelectionContent = () => {
  const { selectPaymentSettings } = useSelectPaymentModal()

  const [disableButtons, setDisableButtons] = useState(false)

  if (!selectPaymentSettings) {
    return null
  }

  const isNativeToken = compareAddress(selectPaymentSettings.currencyAddress, zeroAddress)

  const enableTransferFunds = selectPaymentSettings.enableTransferFunds ?? true
  const enableMainCurrencyPayment = selectPaymentSettings.enableMainCurrencyPayment ?? true
  // Swap payments with native tokens are disabled due to lack of testing
  const enableSwapPayments = !isNativeToken && (selectPaymentSettings.enableSwapPayments ?? true)
  const creditCardProviders = selectPaymentSettings.creditCardProviders ?? []

  return (
    <Box
      flexDirection="column"
      gap="2"
      alignItems="flex-start"
      width="full"
      paddingBottom="4"
      height="full"
      style={{ height: PAYMENT_SELECTION_MODAL_HEIGHT, paddingTop: HEADER_HEIGHT }}
    >
      <Box flexDirection="column" width="full" gap="2">
        <OrderSummary />
        {/* {selectPaymentSettings.collectibles.map(collectible => {
          return <ItemDescription key={collectible.tokenId} tokenId={collectible.tokenId} nftQuantity={collectible.quantity} />
        })} */}
      </Box>
      <Divider width="full" color="backgroundSecondary" marginY="1" />
      {/* <Box marginY="2" width="full" paddingX="6" gap="3" flexDirection="column">
        {creditCardProviders.length > 0 && <PayWithCreditCard settings={selectPaymentSettings} disableButtons={disableButtons} />}
        {(enableMainCurrencyPayment || enableSwapPayments) && (
          <PayWithCrypto settings={selectPaymentSettings} disableButtons={disableButtons} setDisableButtons={setDisableButtons} />
        )}
      </Box> */}
      {enableTransferFunds && (
        <>
          <Divider width="full" color="backgroundSecondary" marginY="1" />
          <TransferFunds />
        </>
      )}
      <Footer />
    </Box>
  )
}
