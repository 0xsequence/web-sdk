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

  const enableMainCurrencyPayment = selectPaymentSettings.enableMainCurrencyPayment ?? true
  const enableSwapPayments = selectPaymentSettings.enableSwapPayments ?? true
  const enableCreditCardPayments = selectPaymentSettings.enableCreditCardPayments ?? true

  const tabs = [
    ...((enableMainCurrencyPayment || enableSwapPayments) ? [
      { label: <Box gap="1" alignItems="center" justifyContent="center"><WalletIcon/>Crypto</Box>, value: 'crypto' },
    ] : []
    ),
    ...(enableCreditCardPayments ? [
      { label: <Box gap="1" alignItems="center" justifyContent="center"><PaymentsIcon />Credit card</Box>, value: 'credit_card' }
    ] : [])
  ]

  const isOneTab = tabs.length === 1

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
        <Text display={isOneTab ? 'none' : "block"} variant="small" color="text50">
          Select a payment method
        </Text>
        <TabsRoot value={selectedTab} onValueChange={value => setSelectedTab(value as Tabs)}>
          {!isOneTab && (
            <TabsHeader
              value={selectedTab}
              tabs={tabs}
            />
          )}
          {(enableMainCurrencyPayment || enableSwapPayments) && (
            <TabsContent value="crypto">
              <PayWithCrypto
                settings={selectPaymentSettings}
                disableButtons={disableButtons}
                setDisableButtons={setDisableButtons}
              />
            </TabsContent>
          )}
          {enableCreditCardPayments && (
            <TabsContent value="credit_card">
              <PayWithCreditCard
                settings={selectPaymentSettings}
                disableButtons={disableButtons}
              />
            </TabsContent>
          )}

        </TabsRoot>
      </Box>
      <Footer />
    </Box>
  )
}