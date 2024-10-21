import { Box, Divider, Tabs, TabsContent, TabsHeader, TabsRoot, Text, WalletIcon, PaymentsIcon } from '@0xsequence/design-system'
import { compareAddress } from '@0xsequence/kit'
import { useState } from 'react'
import { zeroAddress } from 'viem'

import { HEADER_HEIGHT, PAYMENT_SELECTION_MODAL_HEIGHT } from '../../constants'
import { useSelectPaymentModal } from '../../hooks'
import { NavigationHeader } from '../../shared/components/NavigationHeader'

import { Footer } from './Footer'
import { ItemDescription } from './ItemDescription'
import { PayWithCreditCard } from './PayWithCreditCard'
import { PayWithCrypto } from './PayWithCrypto/index'
import { Price } from './Price'

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

  const enableMainCurrencyPayment = selectPaymentSettings.enableMainCurrencyPayment ?? true
  // Swap payments with native tokens are disabled due to lack of testing
  const enableSwapPayments = !isNativeToken && (selectPaymentSettings.enableSwapPayments ?? true)
  const creditCardProviders = selectPaymentSettings.creditCardProviders ?? []

  const tabs = [
    ...(enableMainCurrencyPayment || enableSwapPayments
      ? [
          {
            label: (
              <Box gap="1" alignItems="center" justifyContent="center">
                <WalletIcon />
                Crypto
              </Box>
            ),
            value: 'crypto'
          }
        ]
      : []),
    ...(creditCardProviders.length > 0
      ? [
          {
            label: (
              <Box gap="1" alignItems="center" justifyContent="center">
                <PaymentsIcon />
                Credit card
              </Box>
            ),
            value: 'credit_card'
          }
        ]
      : [])
  ]

  const isOneTab = tabs.length === 1

  const defaultTab: Tabs = (tabs[0]?.value as Tabs) || 'crypto'

  const [selectedTab, setSelectedTab] = useState<Tabs>(defaultTab)

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
        {selectPaymentSettings.collectibles.map(collectible => {
          return <ItemDescription key={collectible.tokenId} tokenId={collectible.tokenId} nftQuantity={collectible.quantity} />
        })}
      </Box>
      <Divider width="full" color="backgroundSecondary" marginY="1" />
      <Price />
      <Divider width="full" color="backgroundSecondary" marginY="1" />
      <Box marginY="2" width="full" paddingX="6" gap="3" flexDirection="column">
        <Text display={isOneTab ? 'none' : 'block'} variant="small" color="text50">
          Select a payment method
        </Text>
        <TabsRoot value={selectedTab} onValueChange={value => setSelectedTab(value as Tabs)}>
          {!isOneTab && <TabsHeader value={selectedTab} tabs={tabs} />}
          {(enableMainCurrencyPayment || enableSwapPayments) && (
            <TabsContent value="crypto">
              <PayWithCrypto
                settings={selectPaymentSettings}
                disableButtons={disableButtons}
                setDisableButtons={setDisableButtons}
              />
            </TabsContent>
          )}
          {creditCardProviders.length > 0 && (
            <TabsContent value="credit_card">
              <PayWithCreditCard settings={selectPaymentSettings} disableButtons={disableButtons} />
            </TabsContent>
          )}
        </TabsRoot>
      </Box>
      <Footer />
    </Box>
  )
}
