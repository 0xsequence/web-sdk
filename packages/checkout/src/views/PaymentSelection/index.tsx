import { useState } from 'react'
import {
  Box,
  Divider.
  TabsContent,
  TabsHeader,
  TabsRoot,
  Text,
} from '@0xsequence/design-system'

import { PayWithCrypto } from './PayWithCrypto/index'
import { PayWithCreditCard } from './PayWithCreditCard'
import { TransferFunds } from './TransferFunds'
import { FiatOnRamp } from './FiatOnRamp'

import { NavigationHeader } from '../../shared/components/NavigationHeader'
import { HEADER_HEIGHT } from '../../constants'
import { useSelectPaymentModal } from '../../hooks'

export const PaymentSelection = () => {
  return (
    <>
      <PaymentSelectionHeader />
      <PaymentSelectionContent />
    </>
  )
}

export const PaymentSelectionHeader = () => {
  return (
    <NavigationHeader primaryText="Checkout" />
  )
}

export const PaymentSelectionContent = () => {
  const { selectPaymentSettings } = useSelectPaymentModal()

  const [disableButtons, setDisableButtons] = useState(false)

  if (!selectPaymentSettings) {
    return null
  }

  const enableMainCurrencyPayment = selectPaymentSettings?.enableMainCurrencyPayment === undefined ?? true
  const enableSwapPayments = selectPaymentSettings?.enableSwapPayments === undefined ?? true
  const enableCreditCardPayments = selectPaymentSettings?.enableCreditCardPayments ?? true
  const enableTransferFunds = selectPaymentSettings?.enableTransferFunds ?? true
  const enableFiatOnRamp = selectPaymentSettings?.enableFiatOnRamp ?? true

  const noPaymentOptionFound =
    !enableMainCurrencyPayment &&
    !enableSwapPayments &&
    !enableTransferFunds &&
    !enableFiatOnRamp &&
    !enableCreditCardPayments

  return (
    <Box
      flexDirection="column"
      gap='2'
      alignItems="flex-start"
      width="full"
      paddingBottom="4"
      height="full"
      style={{ height: '600px', paddingTop: HEADER_HEIGHT }}
    >
      <Box>
        <Text color="text100">Item description</Text>
      </Box>
      <Divider />
      <Box>
      <Text color="text100">Price</Text>
      </Box>
      <Divider />
      <Box>
      <Text color="text100">Toggle</Text>
      </Box>
      {enableCreditCardPayments && (
        <PayWithCreditCard
          settings={selectPaymentSettings}
          disableButtons={disableButtons}
        />
      )}
      {(enableMainCurrencyPayment || enableSwapPayments) && (
        <PayWithCrypto
          settings={selectPaymentSettings}
          disableButtons={disableButtons}
          setDisableButtons={setDisableButtons}
        />
      )}
      {/* {enableTransferFunds && (
        <TransferFunds
          disableButtons={disableButtons}
        />
      )}
      {enableFiatOnRamp && (
        <FiatOnRamp
          disableButtons={disableButtons}
        />
      )} */}
      {noPaymentOptionFound && (
        <Box
          width="full"
          justifyContent="center"
          alignItems="center"
          marginTop="10"
        >
          <Text color="text100">No Payment Option Found</Text>
        </Box>
      )}
    </Box>
  )
}