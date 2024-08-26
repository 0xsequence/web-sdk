import { Box, Text } from '@0xsequence/design-system'
import { NavigationHeader } from '../../shared/components/NavigationHeader'
import { HEADER_HEIGHT } from '../../constants'

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
  return (
    <Box
      paddingTop="0"
      paddingX="5"
      paddingBottom="5"
      style={{
        marginTop: HEADER_HEIGHT
      }}
    >
      <Text color="text100">Payment Selection Content</Text>
      <Text color="text100">Payment Selection Content</Text>
      <Text color="text100">Payment Selection Content</Text>
      <Text color="text100">Payment Selection Content</Text>
    </Box>
  )
}