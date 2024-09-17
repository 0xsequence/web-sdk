import { useState } from 'react'
import {
  Box,
  Divider,
  Tabs,
  TabsContent,
  TabsHeader,
  TabsRoot,
  Text,
  WalletIcon,
  PaymentsIcon
} from '@0xsequence/design-system'

import { ItemDescription } from './ItemDescription'
import { Price } from './Price'
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

type Tabs = 'crypto' | 'credit_card'

export const PaymentSelectionContent = () => {
  const { selectPaymentSettings } = useSelectPaymentModal()
  const defaultTab: Tabs = 'crypto' 
  const [selectedTab, setSelectedTab] = useState<Tabs>(defaultTab)

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
      <ItemDescription />
      <Divider width="full" />
      <Price />
      <Divider width="full" />
      <Box width="full" paddingX="6" gap="3" flexDirection="column">
        <Text variant="small" color="text50">
          Select a payment method
        </Text>
        <TabsRoot value={selectedTab} onValueChange={value => setSelectedTab(value as Tabs)}>
          <TabsHeader
            value={selectedTab}
            tabs={[
              { label: <Box gap="1" alignItems="center" justifyContent="center"><WalletIcon/>Crypto</Box>, value: 'crypto' },
              { label: <Box gap="1" alignItems="center" justifyContent="center"><PaymentsIcon />Credit card</Box>, value: 'credit_card' }
            ]}
          />
          <TabsContent value="crypto">
            <Text color="text100">crypto content</Text>
          </TabsContent>
          <TabsContent value="credit_card">
            <Text color="text100">credit card content</Text>
          </TabsContent>
        </TabsRoot>
      </Box>
      {/* {enableCreditCardPayments && (
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
      )} */}
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