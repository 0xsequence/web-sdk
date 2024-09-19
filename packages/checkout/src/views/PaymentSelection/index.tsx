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
import { Footer } from './Footer'

import { NavigationHeader } from '../../shared/components/NavigationHeader'
import { HEADER_HEIGHT, PAYMENT_SELECTION_MODAL_HEIGHT } from '../../constants'
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

  const tabs = [
    ...((enableMainCurrencyPayment || enableSwapPayments) ? [
      { label: <Box gap="1" alignItems="center" justifyContent="center"><WalletIcon/>Crypto</Box>, value: 'crypto' },
    ] : []
    ),
    ...(enableCreditCardPayments ? [
      { label: <Box gap="1" alignItems="center" justifyContent="center"><PaymentsIcon />Credit card</Box>, value: 'credit_card' }
    ] : [])
  ]

  const defaultTab: Tabs = tabs[0]?.value as Tabs || 'crypto'

  const [selectedTab, setSelectedTab] = useState<Tabs>(defaultTab)

  return (
    <Box
      flexDirection="column"
      gap='2'
      alignItems="flex-start"
      width="full"
      paddingBottom="4"
      height="full"
      style={{ height: PAYMENT_SELECTION_MODAL_HEIGHT, paddingTop: HEADER_HEIGHT }}
    >
      <ItemDescription />
      <Divider width="full" color="backgroundSecondary" style={{ margin: '0px' }} />
      <Price />
      <Divider width="full" color="backgroundSecondary" style={{ margin: '0px' }} />
      <Box marginY="2" width="full" paddingX="6" gap="3" flexDirection="column">
        <Text variant="small" color="text50">
          Select a payment method
        </Text>
        <TabsRoot value={selectedTab} onValueChange={value => setSelectedTab(value as Tabs)}>
          <TabsHeader
            value={selectedTab}
            tabs={tabs}
          />
          <TabsContent value="crypto">
            {(enableMainCurrencyPayment || enableSwapPayments) && (
              <PayWithCrypto
                settings={selectPaymentSettings}
                disableButtons={disableButtons}
                setDisableButtons={setDisableButtons}
              />
            )}
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
      {/* {noPaymentOptionFound && (
        <Box
          width="full"
          justifyContent="center"
          alignItems="center"
          marginTop="10"
        >
          <Text color="text100">No Payment Option Found</Text>
        </Box>
      )} */}
      <Footer />
    </Box>
  )
}