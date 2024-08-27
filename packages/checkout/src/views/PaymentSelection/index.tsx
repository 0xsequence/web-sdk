import { Box, Text } from '@0xsequence/design-system'

import { PayWithCrypto } from './PayWithCrypto'
import { PayWithCreditCard } from './PayWithCreditCard'

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
    <NavigationHeader primaryText="Select Payment Method" />
  )
}

export const PaymentSelectionContent = () => {
  const { selectPaymentSettings = {} } = useSelectPaymentModal()

  const { payWithCrypto, payWithCreditCard } = selectPaymentSettings


  const noPayentOptionFound = !payWithCreditCard && !payWithCreditCard

  return (
    <Box
      flexDirection="column"
      gap='2'
      alignItems="flex-start"
      width="full"
      paddingX="4"
      paddingBottom="4"
      height="full"
      style={{ height: '600px', paddingTop: HEADER_HEIGHT }}
    >
      {payWithCreditCard && (
        <PayWithCreditCard settings={payWithCreditCard} />
      )}
      {payWithCrypto && (
        <PayWithCrypto settings={payWithCrypto} />
      )}
      {noPayentOptionFound && (
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